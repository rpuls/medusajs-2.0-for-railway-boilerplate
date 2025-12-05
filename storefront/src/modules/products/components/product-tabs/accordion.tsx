import React from 'react'
import {
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'

type AccordionItemProps = {
  title: string
  subtitle?: string
  description?: string
  required?: boolean
  tooltip?: string
  forceMountContent?: true
  headingSize?: "small" | "medium" | "large"
  customTrigger?: React.ReactNode
  complete?: boolean
  active?: boolean
  triggerable?: boolean
  children: React.ReactNode
  value?: string
  className?: string
}

type AccordionProps = {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  children: React.ReactNode
  className?: string
}

// Wrapper component - doesn't need 'use client' since it's just a container
const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>
} = ({ children, type = "single", defaultValue, className }) => {
  // MUI Accordion allows multiple items to be expanded by default
  // Each Item manages its own state, so multiple can be open simultaneously
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Item component needs to be client-side because it uses useState and interactive MUI components
// But since index.tsx is already 'use client', this will work fine
const Item: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  headingSize = "large",
  customTrigger = undefined,
  forceMountContent = undefined,
  value,
  ...props
}) => {
  const [expanded, setExpanded] = React.useState(forceMountContent ? true : false)

  const handleChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded)
  }

  return (
    <MuiAccordion
      expanded={expanded}
      onChange={handleChange}
      className={`border-t border-gray-200 last:border-b ${className || ''}`}
      {...props}
    >
      <AccordionSummary
        expandIcon={customTrigger || <ExpandMore />}
        className="px-1 py-3"
      >
        <div className="flex flex-col w-full">
          <div className="flex w-full items-center justify-between">
            <Typography 
              variant={headingSize === "small" ? "body2" : headingSize === "medium" ? "body1" : "h6"}
              className="text-gray-600"
            >
              {title}
            </Typography>
          </div>
          {subtitle && (
            <Typography variant="body2" className="mt-1 text-gray-500">
              {subtitle}
            </Typography>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails className="px-1">
        {description && (
          <Typography variant="body2" className="mb-2 text-gray-600">
            {description}
          </Typography>
        )}
        <div className="w-full">{children}</div>
      </AccordionDetails>
    </MuiAccordion>
  )
}

Accordion.Item = Item

export default Accordion
