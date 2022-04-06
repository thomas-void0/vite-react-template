/* eslint-disable no-unused-vars */
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare namespace Feedback {
	type FeedbackProps = {
		visible: boolean
		setVisible: (visible: boolean) => void
	}
}
