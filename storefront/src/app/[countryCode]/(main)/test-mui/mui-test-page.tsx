'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  Stack,
  Grid,
  Container,
  Badge,
  IconButton,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  ShoppingCart,
  Favorite,
  Share,
  Close,
  ExpandMore,
  Add,
  Remove,
  Delete,
  Search,
} from '@mui/icons-material'
import { HttpTypes } from '@medusajs/types'
import ProductTileWrapper from '@modules/products/components/product-tile/product-tile-wrapper'
import { ProductTileSkeleton } from '@modules/products/components/product-tile'

type MuiTestPageProps = {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  countryCode: string
  pricedProductsMap: Map<string, HttpTypes.StoreProduct>
}

export default function MuiTestPage({ products, region, countryCode, pricedProductsMap }: MuiTestPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' })
  const [activeTab, setActiveTab] = useState(0)
  const [stepperStep, setStepperStep] = useState(0)

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const testCities = [
    { id: 1, name: 'София', post_code: '1000', region: 'София-град' },
    { id: 2, name: 'Пловдив', post_code: '4000', region: 'Пловдив' },
    { id: 3, name: 'Варна', post_code: '9000', region: 'Варна' },
  ]

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h3" component="h1" className="mb-6">
        Material UI Components Test Page
      </Typography>
      <Typography variant="body1" color="text.secondary" className="mb-8">
        This page showcases various MUI components to help decide which ones to use in the storefront.
      </Typography>

      {/* Buttons Section */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Buttons</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" className="mb-4">
          <Button variant="contained">Contained</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="contained" disabled>Disabled</Button>
          <Button variant="contained" startIcon={<ShoppingCart />}>With Icon</Button>
          <Button variant="contained" color="secondary">Secondary</Button>
          <Button variant="contained" color="error">Error</Button>
          <Button variant="contained" color="success">Success</Button>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button size="small" variant="contained">Small</Button>
          <Button size="medium" variant="contained">Medium</Button>
          <Button size="large" variant="contained">Large</Button>
        </Stack>
      </Paper>

      {/* Forms Section */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Form Inputs</Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="Enter your email"
              helperText="We'll never share your email"
              autoComplete="email"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              error
              helperText="Password is required"
              autoComplete="current-password"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="country-select-label">Country</InputLabel>
              <Select labelId="country-select-label" label="Country" defaultValue="bg" id="country-select">
                <MenuItem value="bg">Bulgaria</MenuItem>
                <MenuItem value="us">United States</MenuItem>
                <MenuItem value="uk">United Kingdom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={testCities}
              getOptionLabel={(option) => `гр. ${option.name} [п.к.: ${option.post_code}]`}
              renderInput={(params) => <TextField {...params} label="City (Autocomplete)" />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Subscribe to newsletter" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel control={<Switch defaultChecked />} label="Enable notifications" />
          </Grid>
          <Grid size={12}>
            <FormControl>
              <RadioGroup defaultValue="option1" row>
                <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
                <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
                <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Product Cards Section - Using Optimized ProductTile Component */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Product Cards (Optimized)</Typography>
        <Typography variant="body2" color="text.secondary" className="mb-4">
          Features: Server-side rendering, lazy image loading, loading skeletons, smooth animations, stock status checking
        </Typography>
        {products.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No products available. Please add products to your store.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product, index) => {
              const pricedProduct = pricedProductsMap.get(product.id!)
              if (!pricedProduct) {
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                    <ProductTileSkeleton />
                  </Grid>
                )
              }
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                  <ProductTileWrapper
                    product={product}
                    region={region}
                    countryCode={countryCode}
                    priority={index < 3} // Prioritize first 3 images for LCP
                    pricedProduct={pricedProduct}
                  />
                </Grid>
              )
            })}
          </Grid>
        )}
      </Paper>

      {/* Loading Skeletons */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Loading Skeletons</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} width="60%" />
                  <Skeleton variant="rectangular" height={40} className="mt-4" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Dialog/Modal */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Dialog/Modal</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Open Dialog
        </Button>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle className="flex items-center justify-between">
            Product Details
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" className="mb-4">
              This is a Material UI Dialog component. It can replace the Headless UI Modal.
            </Typography>
            <TextField fullWidth label="Quantity" type="number" defaultValue={1} className="mb-4" />
            <FormControlLabel control={<Checkbox />} label="Add to wishlist" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setDialogOpen(false)
              showSnackbar('Product added to cart!', 'success')
            }}>
              Add to Cart
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      {/* Tabs */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Tabs</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Description" />
            <Tab label="Reviews" />
            <Tab label="Shipping" />
          </Tabs>
        </Box>
        <Box>
          {activeTab === 0 && (
            <Typography>Product description content goes here...</Typography>
          )}
          {activeTab === 1 && (
            <div>
              <Rating value={4.5} readOnly className="mb-2" />
              <Typography variant="body2" color="text.secondary">
                Customer reviews and ratings
              </Typography>
            </div>
          )}
          {activeTab === 2 && (
            <Typography>Shipping information and delivery options</Typography>
          )}
        </Box>
      </Paper>

      {/* Stepper */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Checkout Stepper</Typography>
        <Stepper activeStep={stepperStep} className="mb-4">
          <Step>
            <StepLabel>Delivery</StepLabel>
          </Step>
          <Step>
            <StepLabel>Payment</StepLabel>
          </Step>
          <Step>
            <StepLabel>Review</StepLabel>
          </Step>
        </Stepper>
        <Stack direction="row" spacing={2}>
          <Button
            disabled={stepperStep === 0}
            onClick={() => setStepperStep(Math.max(0, stepperStep - 1))}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => setStepperStep(Math.min(2, stepperStep + 1))}
          >
            {stepperStep === 2 ? 'Finish' : 'Next'}
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Table (Order History)</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>#12345</TableCell>
              <TableCell>2024-12-01</TableCell>
              <TableCell><Chip label="Completed" color="success" size="small" /></TableCell>
              <TableCell>€99.99</TableCell>
              <TableCell>
                <Button size="small" variant="outlined">View</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>#12346</TableCell>
              <TableCell>2024-12-02</TableCell>
              <TableCell><Chip label="Processing" color="warning" size="small" /></TableCell>
              <TableCell>€149.99</TableCell>
              <TableCell>
                <Button size="small" variant="outlined">View</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* Accordion */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Accordion (FAQ)</Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>What is your return policy?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              You can return items within 30 days of purchase. Items must be in original condition.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>How long does shipping take?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Badges & Chips */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Badges & Chips</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" className="mb-4">
          <Badge badgeContent={4} color="primary">
            <ShoppingCart />
          </Badge>
          <Badge badgeContent={99} color="error">
            <Favorite />
          </Badge>
          <Chip label="New" color="primary" />
          <Chip label="Sale" color="error" />
          <Chip label="In Stock" color="success" />
          <Chip label="Out of Stock" color="default" />
          <Chip label="Deletable" onDelete={() => {}} />
        </Stack>
      </Paper>

      {/* Snackbar */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Notifications (Snackbar)</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="contained" color="success" onClick={() => showSnackbar('Success message!', 'success')}>
            Success
          </Button>
          <Button variant="contained" color="error" onClick={() => showSnackbar('Error message!', 'error')}>
            Error
          </Button>
          <Button variant="contained" color="warning" onClick={() => showSnackbar('Warning message!', 'warning')}>
            Warning
          </Button>
          <Button variant="contained" color="info" onClick={() => showSnackbar('Info message!', 'info')}>
            Info
          </Button>
        </Stack>
      </Paper>

      {/* Snackbar Component */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Divider className="my-8" />

      {/* Summary */}
      <Paper elevation={2} className="p-6">
        <Typography variant="h5" className="mb-4">Component Recommendations</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" className="mb-2">✅ High Priority Replacements</Typography>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Autocomplete</strong> - For Econt city/office selection (much better UX)</li>
              <li><strong>TextField</strong> - Replace custom Input component (better validation)</li>
              <li><strong>Dialog</strong> - Replace Headless UI Modal (simpler API)</li>
              <li><strong>Skeleton</strong> - Replace custom loading skeletons</li>
            </ul>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" className="mb-2">💡 Medium Priority</Typography>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Stepper</strong> - For checkout flow visualization</li>
              <li><strong>Table</strong> - For order history, cart items</li>
              <li><strong>Card</strong> - For product cards (consistent styling)</li>
              <li><strong>Snackbar</strong> - For toast notifications</li>
            </ul>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

