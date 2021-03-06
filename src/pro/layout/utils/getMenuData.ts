import memoizeOne from 'memoize-one'
import { isEqual } from 'lodash'
import sha265 from './sha265'
import isUrl from './isUrl'
import { MenuDataItem, Route } from '../../typings/menu'
import { getBreadcrumbNameMap } from './getBreadcrumbNameMap'

interface FormatterProps {
	data: Route[]
	[key: string]: any
}

/**
 * 如果不是 / 开头的和父节点做一下合并
 * 如果是 / 开头的不作任何处理
 * 如果是 url 也直接返回
 * @param path
 * @param parentPath
 */
export const mergePath = (path: string = '', parentPath: string = '/') => {
	if ((path || parentPath).startsWith('/')) {
		return path
	}
	if (isUrl(path)) {
		return path
	}
	return `/${parentPath}/${path}`.replace(/\/\//g, '/').replace(/\/\//g, '/')
}

export function stripQueryStringAndHashFromPath(url: string) {
	return url.split('?')[0].split('#')[0]
}

export const getKeyByPath = (item: MenuDataItem) => {
	const { path } = item
	if (
		!path
		// || path === '/'
	) {
		// 如果还是没有，用对象的hash 生成一个
		try {
			return `/${sha265(JSON.stringify(item))}`
		} catch (error) {
			// dom some thing
		}
	}

	return path ? stripQueryStringAndHashFromPath(path) : path
}

/**
 * 删除 hideInMenu 和 item.name 不存在的
 */
const defaultFilterMenuData = (menuData: MenuDataItem[] = []): MenuDataItem[] =>
	menuData
		.filter((item: MenuDataItem) => item && (item.name || item.children) && !item.hideInMenu)
		.map((item: MenuDataItem) => {
			if (
				item.children &&
				Array.isArray(item.children) &&
				!item.hideChildrenInMenu &&
				item.children.some((child: MenuDataItem) => child && !!child.name)
			) {
				const children = defaultFilterMenuData(item.children)
				if (children.length) return { ...item, children }
			}
			return { ...item, children: undefined }
		})
		.filter(item => item)

const memoizeOneFormatter = memoizeOne(formatter, isEqual)

/**
 * @param routes 路由配置
 * @param ignoreFilter 是否筛选掉不展示的 menuItem 项，plugin-layout需要所有项目来计算布局样式
 * @returns { breadcrumb, menuData}
 */
const transformRoute = (
	routes: Route[]
): {
	breadcrumb: Map<string, MenuDataItem>
	menuData: MenuDataItem[]
	originalMenuData: MenuDataItem[]
} => {
	const originalMenuData = memoizeOneFormatter({
		data: routes
	})

	const menuData = defaultFilterMenuData(originalMenuData)

	// Map type used for internal logic
	const breadcrumb = getBreadcrumbNameMap(originalMenuData)

	return { breadcrumb, menuData, originalMenuData }
}

function formatter(props: FormatterProps, parent: Partial<Route> = { path: '/' }): MenuDataItem[] {
	const { data } = props
	if (!data || !Array.isArray(data)) {
		return []
	}

	return data
		.filter(item => {
			if (!item) return false
			if (item.path === '*' || item.path === '/*') return false
			if (item.redirect) return false
			if (item.routes || item.children) return true
			if (item.path) return true
			return false
		})

		.map((item = { path: '/' }) => {
			const path = mergePath(item.path, parent ? parent.path : '/')

			const { parentKeys = [], ...restParent } = parent

			const finallyItem: Route = {
				...restParent,
				...item,
				path,
				key: item.key || getKeyByPath({ ...item, path }),
				routes: undefined,
				component: undefined,
				parentKeys: Array.from(
					new Set([
						...(item.parentKeys || []),
						...parentKeys,
						`/${parent.key || ''}`.replace(/\/\//g, '/').replace(/\/\//g, '/')
					])
				).filter(key => key && key !== '/')
			}

			if (item.routes || item.children) {
				const formatterChildren = formatter(
					{
						...props,
						data: item.routes! || item.children!
					},
					finallyItem
				)
				// Reduce memory usage
				finallyItem.children =
					formatterChildren && formatterChildren.length > 0 ? formatterChildren : undefined

				if (!finallyItem.children) {
					delete finallyItem.children
				}
			}

			return finallyItem
		})
}

export function fromEntries(iterable: any) {
	return [...iterable].reduce((obj: Record<string, MenuDataItem>, [key, val]) => {
		obj[key] = val
		return obj
	}, {})
}

export default (routes: Route[], menuDataRender?: (menuData: MenuDataItem[]) => MenuDataItem[]) => {
	const { menuData, breadcrumb, originalMenuData } = transformRoute(routes)

	if (!menuDataRender) {
		return {
			breadcrumb: fromEntries(breadcrumb),
			breadcrumbMap: breadcrumb,
			menuData,
			originalMenuData
		}
	}
	const renderData = transformRoute(menuDataRender(menuData))
	return {
		breadcrumb: fromEntries(renderData.breadcrumb),
		breadcrumbMap: renderData.breadcrumb,
		menuData: renderData.menuData,
		originalMenuData: renderData.originalMenuData
	}
}
