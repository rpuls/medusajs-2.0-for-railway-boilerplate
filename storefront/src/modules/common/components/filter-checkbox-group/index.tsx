'use client'

import { Checkbox, FormControlLabel, Typography } from '@mui/material'

type FilterCheckboxGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  selectedValues: string[]
  handleChange: (value: string, checked: boolean) => void
  "data-testid"?: string
}

const FilterCheckboxGroup = ({
  title,
  items,
  selectedValues,
  handleChange,
  "data-testid": dataTestId,
}: FilterCheckboxGroupProps) => {
  return (
    <div className="flex gap-x-3 flex-col" data-testid={dataTestId}>
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'text.secondary',
          fontWeight: 500,
          fontSize: '0.875rem',
        }}
      >
        {title}
      </Typography>
      <div className="flex flex-col">
        {items?.map((item) => {
          const isChecked = selectedValues.includes(item.value)
          return (
            <FormControlLabel
              key={item.value}
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => handleChange(item.value, e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: isChecked ? 500 : 400,
                    color: isChecked ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {item.label}
                </Typography>
              }
              sx={{
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  marginLeft: '8px',
                },
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default FilterCheckboxGroup

