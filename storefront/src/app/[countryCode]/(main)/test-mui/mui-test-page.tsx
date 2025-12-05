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
import { getProductPrice } from '@lib/util/get-product-price'

type MuiTestPageProps = {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function MuiTestPage({ products, region, countryCode }: MuiTestPageProps) {
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

      {/* Product Cards Section */}
      <Paper elevation={2} className="p-6 mb-6">
        <Typography variant="h5" className="mb-4">Product Cards</Typography>
        {products.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No products available. Please add products to your store.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => {
              const { cheapestPrice } = getProductPrice({ product })
              const thumbnail = product.thumbnail || product.images?.[0]?.url
              const hasVariants = product.variants && product.variants.length > 0
              
              // Check if any variant is in stock (matching logic from product-actions)
              const isInStock = hasVariants && (product.variants || []).some((v: any) => {
                // If inventory is not managed, product is always available
                if (!v.manage_inventory) {
                  return true
                }
                // If backorders are allowed, product is available
                if (v.allow_backorder) {
                  return true
                }
                // If inventory is managed and quantity > 0, product is available
                if (v.manage_inventory && (v.inventory_quantity || 0) > 0) {
                  return true
                }
                return false
              })
              
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                  <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                    <CardMedia
                      component="div"
                      className="relative h-48 bg-gray-100 overflow-hidden"
                    >
                      {thumbnail ? (
                        <Link href={`/${countryCode}/products/${product.handle}`}>
                          <Image
                            src={thumbnail}
                            alt={product.title || 'Product image'}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </Link>
                      ) : (
                        <Box className="h-full flex items-center justify-center">
                          <Typography variant="body2" color="text.secondary">
                            No Image
                          </Typography>
                        </Box>
                      )}
                    </CardMedia>
                    <CardContent className="flex-grow">
                      <Link href={`/${region.countries?.[0]?.iso_2 || 'bg'}/products/${product.handle}`}>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          className="mb-2 hover:text-primary cursor-pointer line-clamp-2"
                        >
                          {product.title}
                        </Typography>
                      </Link>
                      {product.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          className="mb-2 line-clamp-2"
                        >
                          {product.description}
                        </Typography>
                      )}
                      {cheapestPrice ? (
                        <Box className="mb-2">
                          {cheapestPrice.price_type === 'sale' && cheapestPrice.original_price_number > cheapestPrice.calculated_price_number ? (
                            <Box>
                              <Typography 
                                variant="body2" 
                                className="line-through text-gray-400"
                              >
                                {cheapestPrice.original_price}
                              </Typography>
                              <Box className="flex items-center gap-2">
                                <Typography variant="h6" color="error" className="font-bold">
                                  {cheapestPrice.calculated_price}
                                </Typography>
                                <Chip 
                                  label={`-${cheapestPrice.percentage_diff}%`} 
                                  size="small" 
                                  color="error"
                                />
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="h6" color="primary" className="font-bold">
                              {cheapestPrice.calculated_price}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Price not available
                        </Typography>
                      )}
                      <Box className="flex gap-2 mt-2 flex-wrap">
                        {isInStock ? (
                          <Chip label="In Stock" size="small" color="success" />
                        ) : (
                          <Chip label="Out of Stock" size="small" color="error" />
                        )}
                        {product.collection && (
                          <Chip 
                            label={product.collection.title || 'Collection'} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions className="p-4 pt-0">
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ShoppingCart />}
                        disabled={!isInStock}
                        component={Link}
                        href={`/${region.countries?.[0]?.iso_2 || 'bg'}/products/${product.handle}`}
                      >
                        {isInStock ? 'View Product' : 'Out of Stock'}
                      </Button>
                    </CardActions>
                  </Card>
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

