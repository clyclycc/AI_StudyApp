import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 ${props.className ?? ''}`}
    />
  )
})

Input.displayName = 'Input'
