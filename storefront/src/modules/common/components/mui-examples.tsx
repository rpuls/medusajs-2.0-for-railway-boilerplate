'use client'

/**
 * Material UI Component Examples for Storefront
 * 
 * This file demonstrates common MUI components that can be used
 * throughout the storefront to speed up development.
 */

import {
  Button,
  TextField,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Rating,
  Chip,
  Skeleton,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { ShoppingCart, Favorite, Share, Close } from '@mui/icons-material'
import { useState } from 'react'

// Example 1: Product Card with MUI
export function ProductCardMUI({ product }: { product: any }) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardMedia
        component="img"
        height="200"
        image={product.thumbnail || '/placeholder.png'}
        alt={product.title}
        className="object-cover"
      />
      <CardContent className="flex-grow">
        <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
        <Rating value={product.rating || 0} readOnly size="small" className="mb-2" />
        <p className="text-2xl font-bold text-primary mb-2">{product.price}</p>
        {product.variants && (
          <div className="flex gap-2 flex-wrap mb-2">
            {product.variants.map((variant: any) => (
              <Chip key={variant.id} label={variant.title} size="small" variant="outlined" />
            ))}
          </div>
        )}
      </CardContent>
      <CardActions className="p-4 pt-0">
        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCart />}
          className="bg-primary hover:bg-primary-dark"
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  )
}

// Example 2: Dialog/Modal with MUI
export function ProductModalMUI({ 
  open, 
  onClose, 
  product 
}: { 
  open: boolean
  onClose: () => void
  product: any 
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        {product?.title}
        <Button onClick={onClose} size="small">
          <Close />
        </Button>
      </DialogTitle>
      <DialogContent>
        <div className="space-y-4">
          {product?.thumbnail && (
            <img 
              src={product.thumbnail} 
              alt={product.title}
              className="w-full h-64 object-cover rounded"
            />
          )}
          <p>{product?.description}</p>
          <div className="flex items-center gap-4">
            <Rating value={product?.rating || 0} readOnly />
            <span className="text-2xl font-bold">{product?.price}</span>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<ShoppingCart />}>
          Add to Cart
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Example 3: Snackbar for Notifications
export function useSnackbar() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success')

  const showSnackbar = (msg: string, sev: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }

  const SnackbarComponent = () => (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )

  return { showSnackbar, SnackbarComponent }
}

// Example 4: Checkout Stepper
export function CheckoutStepperMUI({ activeStep }: { activeStep: number }) {
  const steps = [
    { label: 'Delivery', description: 'Select shipping method' },
    { label: 'Payment', description: 'Enter payment details' },
    { label: 'Review', description: 'Review your order' },
  ]

  return (
    <Stepper activeStep={activeStep} orientation="vertical" className="mb-8">
      {steps.map((step, index) => (
        <Step key={step.label}>
          <StepLabel>{step.label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  )
}

// Example 5: Loading Skeleton
export function ProductCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={32} />
        <Skeleton variant="text" height={24} width="60%" />
        <Skeleton variant="rectangular" height={40} className="mt-4" />
      </CardContent>
    </Card>
  )
}

// Example 6: Form with MUI TextField
export function ContactFormMUI() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  return (
    <form className="space-y-4">
      <TextField
        fullWidth
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <TextField
        fullWidth
        label="Message"
        multiline
        rows={4}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <Button type="submit" variant="contained" fullWidth>
        Send Message
      </Button>
    </form>
  )
}

// Example 7: Select Dropdown
export function CountrySelectMUI({ 
  value, 
  onChange, 
  countries 
}: { 
  value: string
  onChange: (value: string) => void
  countries: { code: string; name: string }[]
}) {
  return (
    <FormControl fullWidth>
      <InputLabel>Country</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="Country"
      >
        {countries.map((country) => (
          <MenuItem key={country.code} value={country.code}>
            {country.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

