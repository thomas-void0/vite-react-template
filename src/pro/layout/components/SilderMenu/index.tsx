import React, { useEffect } from 'react'
import classNames from 'classnames'
import SiderMenu, { PrivateSiderMenuProps, SiderMenuProps } from './SliderMenu'
import { useMenu } from '../../context/MenuContext'
import getFlatMenu from '../../utils/getFlatMenu'
import { omit } from 'lodash-es'
import './index.less'

const SiderMenuWrapper: React.FC<SiderMenuProps & PrivateSiderMenuProps> = props => {
	const { menuData, style, className, hide, prefixCls, matchMenuKeys } = props
	const [, setFlatMenuKeys] = useMenu()

	useEffect(() => {
		if (!menuData || menuData.length < 1) {
			return () => null
		}
		// 当 menu data 改变的时候重新计算这两个参数
		const newFlatMenus = getFlatMenu(menuData)
		const animationFrameId = requestAnimationFrame(() => {
			setFlatMenuKeys(Object.keys(newFlatMenus))
		})
		return () => window.cancelAnimationFrame && window.cancelAnimationFrame(animationFrameId)
	}, [matchMenuKeys.join('-')])

	const omitProps = omit(props, ['className', 'style'])

	if (hide) {
		return null
	}

	return (
		<SiderMenu
			className={classNames(`${prefixCls}-sider`, className)}
			{...omitProps}
			style={style}
		/>
	)
}

export default SiderMenuWrapper
