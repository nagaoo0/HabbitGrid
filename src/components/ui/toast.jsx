import { cn } from '../../lib/utils';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import React from 'react';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
			<ToastPrimitives.Viewport
				ref={ref}
				className={cn(
					'fixed z-[100] flex max-h-screen w-full flex-col-reverse p-4',
					'sm:bottom-4 sm:right-4 sm:top-auto sm:left-auto sm:flex-col md:max-w-[420px]',
					'bottom-4 left-1/2 transform -translate-x-1/2 sm:transform-none',
					className,
				)}
				{...props}
			/>
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
			'data-[swipe=move]:transition-none group relative pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border-0 p-6 pr-8 shadow-2xl transition-all bg-white/80 backdrop-blur-lg ring-2 ring-green-300/40 drop-shadow-xl scale-95 animate-toast-in data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full',
	{
		variants: {
			variant: {
				default: 'bg-background border',
				destructive:
          'group destructive border-destructive bg-destructive text-destructive-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
	return (
		<ToastPrimitives.Root
			ref={ref}
			className={cn(toastVariants({ variant }), className)}
			{...props}
		/>
	);
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(
			'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-destructive/30 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
			className,
		)}
		{...props}
	/>
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		className={cn(
			'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
			className,
		)}
		toast-close=""
		{...props}
	>
		<X className="h-4 w-4" />
	</ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
			<ToastPrimitives.Title
				ref={ref}
				className={cn('text-lg font-bold flex items-center gap-2', className)}
				{...props}
			>
				<span className="animate-float inline-block">🎊</span> {props.children}
			</ToastPrimitives.Title>
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
			<ToastPrimitives.Description
				ref={ref}
				className={cn('text-base opacity-95 font-medium flex items-center gap-2', className)}
				{...props}
			>
				<span className="animate-float inline-block">✨</span> {props.children}
			</ToastPrimitives.Description>
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
	Toast,
	ToastAction,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
};
