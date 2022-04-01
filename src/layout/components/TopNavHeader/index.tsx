import React, { useRef, useState } from 'react'
import { HeaderViewProps } from '../HeaderView'
import ResizeObserver from 'rc-resize-observer'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

export type TopNavHeaderProps = HeaderViewProps

// 默认渲染logo
const defaultRenderLogo = (logo: React.ReactNode) => {
	if (typeof logo === 'string') {
		return <img src={logo} alt="logo" />
	}
	if (typeof logo === 'function') {
		return logo()
	}
	return logo
}

const defaultRenderLogoAndTitle = (
	props,
	renderKey: string = 'menuHeaderRender'
): React.ReactNode => {
	const { logo, title } = props
	const renderFunction = props[renderKey || '']

	if (renderFunction === false) {
		return null
	}
	const logoDom = defaultRenderLogo(logo)
	const titleDom = <h1>{title}</h1>

	if (renderFunction) {
		// 折叠的时候，不渲染title
		return renderFunction(logoDom, props.collapsed ? null : titleDom, props)
	}

	if (renderKey === 'menuHeaderRender') {
		return null
	}

	return <div>123</div>
	// return (
	// 	<Link to="/">
	// 		{logoDom}
	// 		{props.collapsed ? null : titleDom}
	// 	</Link>
	// )
}

// 抽离出来是为了防止 rightSize 经常改变导致菜单 render
const RightContent: React.FC<TopNavHeaderProps> = ({ rightContentRender, ...props }) => {
	const [rightSize, setRightSize] = useState<number | string>('auto')

	return (
		<div
			style={{
				minWidth: rightSize
			}}
		>
			<div style={{ paddingRight: 8 }}>
				<ResizeObserver
					onResize={({ width }) => {
						setRightSize(width)
					}}
				>
					{rightContentRender && <div>{rightContentRender({ ...props })}</div>}
				</ResizeObserver>
			</div>
		</div>
	)
}

const TopNavHeader: React.FC<TopNavHeaderProps> = props => {
	const ref = useRef(null)
	const {
		onMenuHeaderClick,
		contentWidth,
		rightContentRender,
		className: propsClassName,
		style
	} = props

	const prefixCls = `${props.prefixCls || 'ant-pro'}-top-nav-header`
	const headerDom = defaultRenderLogoAndTitle({ ...props, collapsed: false }, 'headerTitleRender')

	const className = classNames(prefixCls, propsClassName, 'light')

	const overflowedIndicatorPopupClassName = 'overflow-hide-popover'

	return (
		<div className={className} style={style}>
			<div ref={ref} className={`${prefixCls}-main ${contentWidth === 'Fixed' ? 'wide' : ''}`}>
				{headerDom && (
					<div
						className={`${prefixCls}-main-left`}
						onClick={onMenuHeaderClick}
						style={{ width: props.siderWidth }}
					>
						<div className={`${prefixCls}-logo`} key="logo" id="logo">
							{headerDom}
						</div>
					</div>
				)}
				<div style={{ flex: 1 }} className={`${prefixCls}-menu`}>
					{/* <BaseMenu
						{...props}
						{...props.menuProps}
						menuProps={{
							...props.menuProps,
							overflowedIndicatorPopupClassName
						}}
						menuItemRender={(renderItemProps, defaultDom) => {
							return renderItemProps.routes ? (
								<MenuPopover
									renderItemProps={renderItemProps}
									prefixCls={prefixCls}
									overflowedIndicatorPopupClassName={overflowedIndicatorPopupClassName}
								>
									{defaultDom}
								</MenuPopover>
							) : (
								<Link to={renderItemProps.path!}>{defaultDom}</Link>
							)
						}}
					/> */}
				</div>
				{rightContentRender && <RightContent rightContentRender={rightContentRender} {...props} />}
			</div>
		</div>
	)
}

export default React.memo(TopNavHeader)
