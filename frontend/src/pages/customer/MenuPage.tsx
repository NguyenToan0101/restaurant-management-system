import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { restaurantApi, menuItemApi, categoryApi, branchApi, waiterOrderApi } from '@/api'
import { useToast } from '@/hooks/use-toast'
import type { RestaurantDTO, MenuItemDTO, CategoryDTO, BranchDTO, CreateOrderRequest, CreateOrderItemRequest } from '@/types/dto'

// Format currency to Vietnamese Dong
const formatVND = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export default function MenuPage() {
  const navigate = useNavigate()
  const { slug, tableId } = useParams<{ slug?: string; tableId?: string }>()
  const { toast } = useToast()
  
  const [restaurant, setRestaurant] = useState<RestaurantDTO | null>(null)
  const [branches, setBranches] = useState<BranchDTO[]>([])
  const [selectedBranch, setSelectedBranch] = useState<BranchDTO | null>(null)
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [menuItems, setMenuItems] = useState<MenuItemDTO[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [basket, setBasket] = useState([])
  const [orderLoading, setOrderLoading] = useState(false)
  const [showBasketOnly] = useState(!!tableId)

  // Fetch restaurant data on mount or when slug changes
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use slug if available, otherwise use a default or show error
        const restaurantSlug = slug || 'default'
        
        // Try to fetch by slug first
        try {
          const restaurantData = await restaurantApi.getBySlug(restaurantSlug)
          setRestaurant(restaurantData)
          
          // Fetch branches for this restaurant
          const branchesData = await branchApi.getByPublicRestaurant(restaurantData.restaurantId)
          setBranches(branchesData)
          if (branchesData.length > 0) {
            setSelectedBranch(branchesData[0])
          }
          
          // Fetch categories for this restaurant
          const categoriesData = await categoryApi.getAllByRestaurant(restaurantData.restaurantId)
          setCategories(categoriesData.data.result)
          if (categoriesData.data.result.length > 0) {
  setSelectedCategory(categoriesData.data.result[0].id)
}
          
          // Fetch menu items for this restaurant
          const menuResponse = await menuItemApi.getAllByRestaurant(restaurantData.restaurantId)
          setMenuItems(menuResponse.data.result || [])
         
        } catch (slugError) {
          // If slug doesn't work, use mock data for now
          console.warn('Could not fetch restaurant by slug, using fallback')
          setMenuItems([
            {
              id: '1',
              name: 'Wagyu Beef Carpaccio',
              price: 34.00,
              description: 'Thinly sliced A5 Wagyu, shaved black winter truffles, aged parmesan crisps, and wild baby arugula with a lemon-caper vinaigrette.',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-P_RNpmK_dU8AFzuBlc9E-_qOsAGWowzzMBxaiCH8mSTOA1ZN7XPaaYzIxoRToQ30QNyLBo1FiJodP7k_yJbOuEb9fmJWLHQov4LCtGXceMipCalPv3kk0NB5RIULkSHJWe-L29OHOrq-W40aEgYel7nrmg7NOBkU40Wztu8sG7Rmaq6xpuI0p8parEgq0HYW_yM-_fJk86kKl1YYdfAPieYzlghN2pAjEIgCUh-6uzKkYmVImST_tJAzaxGo3CuLRsjroCwLrPk',
              restaurantId: '1',
              categoryId: '1',
              status: 'ACTIVE',
              hasCustomization: false,
              isBestSeller: false,
            },
            {
              id: '2',
              name: 'Black Truffle Risotto',
              price: 42.00,
              description: 'Creamy Acquerello rice slow-cooked with roasted forest mushrooms and topped with fresh black truffle shavings.',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJd-nqcyvyG2fIMTmTC45iYAb6EFUwhRtZvnF4e9zez65jkebxwC10J8M7XAX1TMa30ymqdIYGlnrXVWSxNbqgrkToJTfak7C7uwTds7_teNzPDYsIk3QdDas_yAa176mSCi-PBFeZOLYdfRPuiAJF63en9pNo57JjelLpdbGgpEruVK06dabw0WYLTbfezzYLdduyQUGq5xOQAZmLsLCZv6h-v5eYAp1a78tPBHvKQbvOZZjzliSlAMbwVZqpin-IUJNybj0VrAg',
              restaurantId: '1',
              categoryId: '1',
              status: 'ACTIVE',
              hasCustomization: false,
              isBestSeller: false,
            }
          ] as any)
        }
      } catch (err) {
        console.error('Error fetching restaurant data:', err)
        setError('Failed to load restaurant data')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurantData()
  }, [slug])

  // const addToBasket = (item: any) => {
  //   setBasket([...basket, { ...item, qty: 1, notes: '', id: Math.random() }])
  // }

  // const removeFromBasket = (id: any) => {
  //   setBasket(basket.filter(item => item.id !== id))
  // }

  // const updateQty = (id: any, qty: number) => {
  //   if (qty <= 0) {
  //     removeFromBasket(id)
  //   } else {
  //     setBasket(basket.map(item => item.id === id ? { ...item, qty } : item))
  //   }
  // }

  const addToBasket = (item: any) => {
  setBasket([
    ...basket,
    {
      ...item,
      basketId: Math.random(), // id cho basket
      menuItemId: item.id,     // giữ id thật
      qty: 1,
      notes: '',
    },
  ])
}
const updateQty = (basketId: any, qty: number) => {
  if (qty <= 0) {
    removeFromBasket(basketId)
  } else {
    setBasket(
      basket.map(item =>
        item.basketId === basketId ? { ...item, qty } : item
      )
    )
  }
}
  const removeFromBasket = (basketId: any) => {
  setBasket(basket.filter(item => item.basketId !== basketId))
}

  const subtotal = basket.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const filteredMenuItems = selectedCategory
    ? menuItems.filter((item: any) => item.categoryId === selectedCategory)
    : menuItems

  const navigateTo = (path: string) => {
    if (slug) {
      navigate(`/${slug}${path}`)
    } else {
      navigate(path)
    }
  }

  const handleCompleteOrder = async () => {
    if (!tableId) {
      toast({
        title: 'Error',
        description: 'Table ID not found. Please access menu from a table.',
        variant: 'destructive',
      })
      return
    }

    if (basket.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add items to your order first.',
        variant: 'destructive',
      })
      return
    }

    try {
      setOrderLoading(true)

      // Transform basket to CreateOrderRequest format
      // const orderItems: CreateOrderItemRequest[] = basket.map((item: any) => ({
      //   menuItemId: item.id,
      //   quantity: item.qty,
      //   note: item.notes || '',
      //   customizations: item.customizations || [],
      // }))
      const orderItems = basket.map((item) => ({
  menuItemId: item.menuItemId,
  quantity: item.qty,
  note: item.notes,
  // customizations: item.customizations.map((id: string) => ({
  //   customizationOptionId: id
  // }))
}))
      
      const createOrderRequest: CreateOrderRequest = {
        areaTableId: tableId,
        items: orderItems,
      }
      console.log('oder iterm', orderItems)
      console.log('Create ordẻr', createOrderRequest)
      // Call backend API to create order
      const response = await waiterOrderApi.createOrder(createOrderRequest)

      // Clear basket on success
      setBasket([])

      // Show success notification
      toast({
        title: 'Success!',
        description: `Your order has been placed successfully. Please wait for your food, we will bring it to you as soon as possible.`,
      })

      // Wait 2 seconds then navigate back
      setTimeout(() => {
        navigateTo(`/menu/${tableId}`)
      }, 2000)
    } catch (err: any) {
      console.error('Error creating order:', err)
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create order. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="customer-theme dark bg-background-dark flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-300">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-theme dark bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background-dark backdrop-blur-md border-b border-primary/10 px-6 lg:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="text-primary">
              <span className="material-symbols-outlined text-3xl">restaurant</span>
            </div>
            <h2 className="text-slate-100 text-xl font-bold tracking-widest">{restaurant?.name || 'LUMIÈRE'}</h2>
         </div>
          
          <nav className="hidden md:flex items-center gap-10">
            <Link to={slug ? `/${slug}/home` : '/home'} className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Home</Link>
            <Link to={slug ? `/${slug}/reservations` : '/reservations'} className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Reservations</Link>
            <a href={slug ? `/${slug}/menu` : '/menu'} className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Menu</a>
            <a href="#" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-6">
            <Link to={slug ? `/${slug}/reservations` : '/reservations'} className="hidden sm:flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-all">
              Book Now
            </Link>
            {/* <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-primary/20" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAiOgEqohQsk5k_CZWwTHb05xpYZERL9tIaWeMXzexkFlioYAbgSGrrCmtubYeOLrU6aMWKZ0Ayp_YomlMFhsX5Cz7H6x9O9gYBOlyR0DwXsxgqytrPkK_Cbm8cPb5iSrDyKHfnBk222XmlKWxXNFWpUBmRU053GK4d-5XOW4d1SVdWk26TdxayJi5Wiia3_-CPzpcs1VPOiyHDsUdEzdsUZadeckdQkgTK5YhcSoD-ZCxL2xmVIiSSQZUXGRiKXMZ3sl78u6IC0Mc")'}}></div> */}
          </div>
        </div>
      </header>

      <main className="customer-theme dark bg-background-light dark:bg-background-dark flex flex-col lg:flex-row mx-auto w-full grow px-4 md:px-10 py-20 gap-8">
        {/* Main Menu Content */}
        <div className="flex-1 space-y-8">
          {/* Hero Banner */}
          <div className="relative rounded-xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 bg-slate-900 shadow-2xl">
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZ9sv2Ovg-UPbxV8wVJJ8cAfSRh0KOwJEf0HtoowdCi7F8CXe75KewCSNMnqj7qCQ7EOMwVyLU3XILcLFTgqUU-F1VD_ROr8p96h6ehf9661YGjvMWa9IFbuI14FQ28_sQsKqiW4mtfKm6y8txDGNcfS4jg1Pe83bUOwXPZJtqbOioY85pCHJojPdbiohJGm8TzPGl8qPAIb5hOfX-PHMBv9_iFU2TBy5OGiIZ40kWg21vcWScsw6edwCYoImaBSBYPJ_YrR2z-KU")'}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-primary text-xs font-bold rounded-full mb-4">SEASONAL MENU</span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight">The Art of Fine Dining</h1>
              <p className="text-slate-300 max-w-xl text-lg">{restaurant?.description || 'Experience a symphony of flavors crafted by Michelin-starred chefs using only the finest seasonal ingredients.'}</p>
            </div>
          </div>

          {/* Categories Tabs */}
          <div className="sticky top-[88px] z-40 bg-background-light dark:bg-background-dark py-4 border-b border-slate-200 dark:border-primary/10">
            <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(category => (
                <button 
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-none border-b-2 pb-2 font-bold text-sm tracking-wide transition-colors ${
                    selectedCategory === category.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-primary'
                  }`}
                >
                  {category.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredMenuItems.map((item: any) => (
              <div key={item.basketId} className="group flex flex-col bg-white dark:bg-primary/5 rounded-xl overflow-hidden border border-slate-200 dark:border-primary/10 hover:shadow-xl transition-all">
                <div className="h-35 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: `url("${item.image}")`}}></div>
                <img alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={item.media?.url || 'https://via.placeholder.com/400x500'} />
                <div className="p-6 flex flex-col grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{item.name}</h3>
                    <span className="text-primary font-bold">{formatVND(item.price)}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 grow">{item.description}</p>
                  {tableId ? (
                    <button  onClick={() => addToBasket(item)} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-lg hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
                      Add to Basket
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar / Gourmet Basket */}
        {tableId && (
        <aside className="w-full lg:w-96">
          <div className="sticky top-[88px] flex flex-col bg-white dark:bg-primary/5 rounded-2xl border border-slate-200 dark:border-primary/20 shadow-xl overflow-hidden min-h-[600px]">
            <div className="p-6 border-b border-slate-100 dark:border-primary/10 bg-slate-50 dark:bg-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>shopping_basket</span>
                  <h2 className="text-xl font-bold text-white">Order Item</h2>
                </div>
                <span className="px-2 py-1 bg-primary/20 text-red-600 text-xs font-bold rounded">{basket.length} ITEMS</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {basket.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="size-20 rounded-lg bg-cover bg-center shrink-0" style={{backgroundImage: `url("${item.media?.url || item.image || 'https://via.placeholder.com/150'}")`}}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <button onClick={() => removeFromBasket(item.basketId)} className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQty(item.basketId, item.qty - 1)} className="size-6 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">-</button>
                        <span className="text-sm font-bold text-stone-200">{item.qty}</span>
                        <button onClick={() => updateQty(item.basketId, item.qty + 1)} className="size-6 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">+</button>
                      </div>
                      <span className="text-sm font-bold text-stone-200">{formatVND(item.price * item.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-primary/10 border-t border-slate-200 dark:border-primary/20 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tax (10%)</span>
                  <span>{formatVND(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-primary/20">
                  <span className='text-zinc-300'>Total</span>
                  <span className="text-primary">{formatVND(total)}</span>
                </div>
              </div>
              <button 
                onClick={handleCompleteOrder}
                disabled={orderLoading}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
              >
                {orderLoading ? 'Processing...' : 'Complete Order'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">Prices exclude 12% service charge</p>
            </div>
          </div>
        </aside>
        )}
      </main>

      <footer className="mt-auto py-12 px-10 border-t border-slate-200 dark:border-primary/10 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 text-primary opacity-60 grayscale">
            <span className="text-white material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
            <h2 className="text-lg font-extrabold tracking-tight uppercase text-white">{restaurant?.name || 'L\'Élite'}</h2>
          </div>
          <div className="flex gap-8 text-slate-400 text-sm font-medium">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#">Allergens Information</a>
            <a className="hover:text-primary transition-colors" href="#">Contact: {restaurant?.restaurantPhone || 'N/A'}</a>
          </div>
          <div className="flex gap-4">
            <a className="size-8 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all" href="#">
              <span className="material-symbols-outlined text-base">public</span>
            </a>
            <a className="size-8 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all" href="mailto:{restaurant?.email}">
              <span className="material-symbols-outlined text-base">mail</span>
            </a>
          </div>
        </div>
        <p className="text-center text-slate-400 text-xs mt-8">© 2024 {restaurant?.name || 'L\'Élite'} Gastronomie. All rights reserved.</p>
      </footer>
    </div>
  )
}
      {/* Top Navigation Bar */}
      {/* <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-primary/20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
              <h2 className="text-xl font-extrabold tracking-tight uppercase">L'Élite</h2>
            </div>
            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/menu" className="text-sm font-semibold hover:text-primary transition-colors">Menu</Link>
              <Link to="/reservations" className="text-sm font-semibold hover:text-primary transition-colors">Reservations</Link>
              <a href="#" className="text-sm font-semibold hover:text-primary transition-colors">Private Dining</a>
              <a href="#" className="text-sm font-semibold hover:text-primary transition-colors">Our Story</a>
            </nav>
          </div>
          <div className="flex flex-1 justify-end items-center gap-6">
            <div className="hidden md:flex relative w-full max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input className="w-full bg-slate-100 dark:bg-primary/10 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50" placeholder="Search delicacies..." type="text" />
            </div>
            <Link to="/reservations" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
              Book a Table
            </Link>
            <div className="size-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
          </div>
        </div>
      </header> */}
//       <header className="fixed top-0 w-full z-50 bg-background-dark backdrop-blur-md border-b border-primary/10 px-6 lg:px-20 py-4">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="text-primary">
//               <span className="material-symbols-outlined text-3xl">restaurant</span>
//             </div>
//             <h2 className="text-slate-100 text-xl font-bold tracking-widest">LUMIÈRE</h2>
//           </div>
//           <nav className="hidden md:flex items-center gap-10">
//             <Link to="/home" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Home</Link>
//             <Link to="/reservations" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Reservations</Link>
//             <a href="/menu" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Menu</a>
//             <a href="#" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">About</a>
//           </nav>
//           <div className="flex items-center gap-6">
//             <Link to="/reservations" className="hidden sm:flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-all">
//               Book Now
//             </Link>
//             <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-primary/20" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAiOgEqohQsk5k_CZWwTHb05xpYZERL9tIaWeMXzexkFlioYAbgSGrrCmtubYeOLrU6aMWKZ0Ayp_YomlMFhsX5Cz7H6x9O9gYBOlyR0DwXsxgqytrPkK_Cbm8cPb5iSrDyKHfnBk222XmlKWxXNFWpUBmRU053GK4d-5XOW4d1SVdWk26TdxayJi5Wiia3_-CPzpcs1VPOiyHDsUdEzdsUZadeckdQkgTK5YhcSoD-ZCxL2xmVIiSSQZUXGRiKXMZ3sl78u6IC0Mc")'}}></div>
//           </div>
//         </div>
//       </header>

//       <main className="customer-theme dark bg-background-light dark:bg-background-dark flex flex-col lg:flex-row  mx-auto w-full grow px-4 md:px-10 py-20 gap-8">
//         {/* Main Menu Content */}
//         <div className="flex-1 space-y-8">
//           {/* Hero Banner */}
//           <div className="relative rounded-xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 bg-slate-900 shadow-2xl">
//             <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZ9sv2Ovg-UPbxV8wVJJ8cAfSRh0KOwJEf0HtoowdCi7F8CXe75KewCSNMnqj7qCQ7EOMwVyLU3XILcLFTgqUU-F1VD_ROr8p96h6ehf9661YGjvMWa9IFbuI14FQ28_sQsKqiW4mtfKm6y8txDGNcfS4jg1Pe83bUOwXPZJtqbOioY85pCHJojPdbiohJGm8TzPGl8qPAIb5hOfX-PHMBv9_iFU2TBy5OGiIZ40kWg21vcWScsw6edwCYoImaBSBYPJ_YrR2z-KU")'}}></div>
//             <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
//             <div className="relative z-10">
//               <span className="inline-block px-3 py-1 bg-primary text-xs font-bold rounded-full mb-4">SEASONAL MENU</span>
//               <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight">The Art of Fine Dining</h1>
//               <p className="text-slate-300 max-w-xl text-lg">Experience a symphony of flavors crafted by Michelin-starred chefs using only the finest seasonal ingredients.</p>
//             </div>
//           </div>

//           {/* Categories Tabs */}
//           <div className="sticky top-[88px] z-40 bg-background-light dark:bg-background-dark py-4 border-b border-slate-200 dark:border-primary/10">
//             <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
//               <button className="flex-none border-b-2 border-primary text-primary pb-2 font-bold text-sm tracking-wide">APPETIZERS</button>
//               <button className="flex-none border-b-2 border-transparent text-slate-500 hover:text-primary pb-2 font-bold text-sm tracking-wide transition-colors">MAIN COURSES</button>
//               <button className="flex-none border-b-2 border-transparent text-slate-500 hover:text-primary pb-2 font-bold text-sm tracking-wide transition-colors">DESSERTS</button>
//               <button className="flex-none border-b-2 border-transparent text-slate-500 hover:text-primary pb-2 font-bold text-sm tracking-wide transition-colors">FINE WINES</button>
//               <button className="flex-none border-b-2 border-transparent text-slate-500 hover:text-primary pb-2 font-bold text-sm tracking-wide transition-colors">SIGNATURE COCKTAILS</button>
//             </div>
//           </div>

//           {/* Menu Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {menuItems.map(item => (
//               <div key={item.id} className="group flex flex-col bg-white dark:bg-primary/5 rounded-xl overflow-hidden border border-slate-200 dark:border-primary/10 hover:shadow-xl transition-all">
//                 <div className="h-56 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: `url("${item.image}")`}}></div>
//                 <div className="p-6 flex flex-col grow">
//                   <div className="flex justify-between items-start mb-2">
//                     <h3 className="text-lg font-bold text-white">{item.name}</h3>
//                     <span className="text-primary font-bold">${item.price.toFixed(2)}</span>
//                   </div>
//                   <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 grow">{item.description}</p>
//                   <button onClick={() => addToBasket({...item, qty: 1, notes: '', id: Math.random()})} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-lg hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors">
//                     <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
//                     Add to Basket
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Sidebar / Gourmet Basket */}
//         <aside className="w-full lg:w-96">
//           <div className="sticky top-[88px] flex flex-col bg-white dark:bg-primary/5 rounded-2xl border border-slate-200 dark:border-primary/20 shadow-xl overflow-hidden min-h-[600px]">
//             <div className="p-6 border-b border-slate-100 dark:border-primary/10 bg-slate-50 dark:bg-primary/10">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>shopping_basket</span>
//                   <h2 className="text-xl font-bold text-white">Gourmet Basket</h2>
//                 </div>
//                 <span className="px-2 py-1 bg-primary/20 text-red-600 text-xs font-bold rounded">{basket.length} ITEMS</span>
//               </div>
//               <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
//                 <div className="flex items-center gap-1">
//                   <span className="material-symbols-outlined text-sm">schedule</span>
//                   45 mins
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <span className="material-symbols-outlined text-sm">person</span>
//                   Table 12
//                 </div>
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {basket.map(item => (
//                 <div key={item.id} className="flex gap-4">
//                   <div className="size-20 rounded-lg bg-cover bg-center shrink-0" style={{backgroundImage: `url("${item.image}")`}}></div>
//                   <div className="flex-1">
//                     <div className="flex justify-between items-start mb-1">
//                       <h4 className="text-sm font-bold text-white">{item.name}</h4>
//                       <button onClick={() => removeFromBasket(item.id)} className="text-slate-400 hover:text-primary transition-colors">
//                         <span className="material-symbols-outlined text-lg">close</span>
//                       </button>
//                     </div>
//                     <p className="text-xs text-slate-500 mb-2">{item.notes}</p>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <button onClick={() => updateQty(item.id, item.qty - 1)} className="size-6 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">-</button>
//                         <span className="text-sm font-bold text-stone-200">{item.qty}</span>
//                         <button onClick={() => updateQty(item.id, item.qty + 1)} className="size-6 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">+</button>
//                       </div>
//                       <span className="text-sm font-bold text-stone-200">${(item.price * item.qty).toFixed(2)}</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="p-6 bg-slate-50 dark:bg-primary/10 border-t border-slate-200 dark:border-primary/20 space-y-4">
//               <div className="space-y-2">
//                 <div className="flex justify-between text-sm text-slate-500">
//                   <span>Subtotal</span>
//                   <span>${subtotal.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-sm text-slate-500">
//                   <span>Tax (10%)</span>
//                   <span>${tax.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-primary/20">
//                   <span className='text-zinc-300'>Total</span>
//                   <span className="text-primary">${total.toFixed(2)}</span>
//                 </div>
//               </div>
//               <button onClick={() => navigate('/checkout')} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
//                 Complete Order
//                 <span className="material-symbols-outlined">arrow_forward</span>
//               </button>
//               <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">Prices exclude 12% service charge</p>
//             </div>
//           </div>
//         </aside>
//       </main>

//       <footer className="mt-auto py-12 px-10 border-t border-slate-200 dark:border-primary/10 bg-white dark:bg-background-dark">
//         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
//           <div className="flex items-center gap-3 text-primary opacity-60 grayscale">
//             <span className="text-white material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
//             <h2 className="text-lg font-extrabold tracking-tight uppercase text-white">L'Élite</h2>
//           </div>
//           <div className="flex gap-8 text-slate-400 text-sm font-medium">
//             <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
//             <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
//             <a className="hover:text-primary transition-colors" href="#">Allergens Information</a>
//             <a className="hover:text-primary transition-colors" href="#">Contact</a>
//           </div>
//           <div className="flex gap-4">
//             <a className="size-8 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all" href="#">
//               <span className="material-symbols-outlined text-base">public</span>
//             </a>
//             <a className="size-8 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all" href="#">
//               <span className="material-symbols-outlined text-base">mail</span>
//             </a>
//           </div>
//         </div>
//         <p className="text-center text-slate-400 text-xs mt-8">© 2024 L'Élite Gastronomie. All rights reserved.</p>
//       </footer>
//     </div>
//   )
// }
