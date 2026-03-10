import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function MenuPage() {
  const navigate = useNavigate()
  const [basket, setBasket] = useState([
    { id: 1, name: 'Wagyu Beef Carpaccio', price: 34.00, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-P_RNpmK_dU8AFzuBlc9E-_qOsAGWowzzMBxaiCH8mSTOA1ZN7XPaaYzIxoRToQ30QNyLBo1FiJodP7k_yJbOuEb9fmJWLHQov4LCtGXceMipCalPv3kk0NB5RIULkSHJWe-L29OHOrq-W40aEgYel7nrmg7NOBkU40Wztu8sG7Rmaq6xpuI0p8parEgq0HYW_yM-_fJk86kKl1YYdfAPieYzlghN2pAjEIgCUh-6uzKkYmVImST_tJAzaxGo3CuLRsjroCwLrPk', qty: 1, notes: 'No onions, extra parmesan' },
    { id: 2, name: 'Black Truffle Risotto', price: 42.00, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJd-nqcyvyG2fIMTmTC45iYAb6EFUwhRtZvnF4e9zez65jkebxwC10J8M7XAX1TMa30ymqdIYGlnrXVWSxNbqgrkToJTfak7C7uwTds7_teNzPDYsIk3QdDas_yAa176mSCi-PBFeZOLYdfRPuiAJF63en9pNo57JjelLpdbGgpEruVK06dabw0WYLTbfezzYLdduyQUGq5xOQAZmLsLCZv6h-v5eYAp1a78tPBHvKQbvOZZjzliSlAMbwVZqpin-IUJNybj0VrAg', qty: 1, notes: 'Standard serving' }
  ])

  const addToBasket = (item) => {
    setBasket([...basket, item])
  }

  const removeFromBasket = (id) => {
    setBasket(basket.filter(item => item.id !== id))
  }

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      removeFromBasket(id)
    } else {
      setBasket(basket.map(item => item.id === id ? { ...item, qty } : item))
    }
  }

  const subtotal = basket.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const menuItems = [
    {
      id: 1,
      name: 'Wagyu Beef Carpaccio',
      price: 34.00,
      description: 'Thinly sliced A5 Wagyu, shaved black winter truffles, aged parmesan crisps, and wild baby arugula with a lemon-caper vinaigrette.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-P_RNpmK_dU8AFzuBlc9E-_qOsAGWowzzMBxaiCH8mSTOA1ZN7XPaaYzIxoRToQ30QNyLBo1FiJodP7k_yJbOuEb9fmJWLHQov4LCtGXceMipCalPv3kk0NB5RIULkSHJWe-L29OHOrq-W40aEgYel7nrmg7NOBkU40Wztu8sG7Rmaq6xpuI0p8parEgq0HYW_yM-_fJk86kKl1YYdfAPieYzlghN2pAjEIgCUh-6uzKkYmVImST_tJAzaxGo3CuLRsjroCwLrPk'
    },
    {
      id: 2,
      name: 'Diver Sea Scallops',
      price: 38.00,
      description: 'Pan-seared Hokkaido scallops, silky parsnip purée, pomegranate reduction, and micro-cilantro.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWXjIy4YztizYtHxMFlszUJnaet89XtdRrdiSQgEZk7829QX6E-KSW0Pt9wky7nGm3r0ZEZX8_7KYiwarpYaPvIEqw0NA0mdbPRAsL0zHM7d6NfjdEov05G5kdn_PR7eW9leAen_MRO30vTzHErlrfRKr1S8nokdGo06tOMc9n8qS6K3_Vyhfh6b5OfdU2CVJrlPBxWNf2CoLWYKKHR7LqX5K1KcrrENAQ-lHFnbJ6nQK72rxPPUVjrWYjqzkVFwVAU_WM3JBtRSY'
    },
    {
      id: 3,
      name: 'Black Truffle Risotto',
      price: 42.00,
      description: 'Creamy Acquerello rice slow-cooked with roasted forest mushrooms and topped with fresh black truffle shavings.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJd-nqcyvyG2fIMTmTC45iYAb6EFUwhRtZvnF4e9zez65jkebxwC10J8M7XAX1TMa30ymqdIYGlnrXVWSxNbqgrkToJTfak7C7uwTds7_teNzPDYsIk3QdDas_yAa176mSCi-PBFeZOLYdfRPuiAJF63en9pNo57JjelLpdbGgpEruVK06dabw0WYLTbfezzYLdduyQUGq5xOQAZmLsLCZv6h-v5eYAp1a78tPBHvKQbvOZZjzliSlAMbwVZqpin-IUJNybj0VrAg'
    },
    {
      id: 4,
      name: 'Maine Lobster Tail',
      price: 56.00,
      description: 'Butter-poached lobster tail served with saffron-infused beurre blanc and seasonal baby vegetables.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsi8nrXP2XlcNEEo1UTStWiV454c9aL7AJwGk93lVXKrGT7djUZ50LPEAvJ_6iX02hx1gCzJA6hJU5yVH_dShSveb4tnPy8Wp00YYheSlZvCTKYX_9-IJrnbydWBLe0tk6Kwyu7q3mQIj93HmwqQaOM2xxqtB3nZ0nnN8O6j0ZIzFQQunk-PAsXGWk8I_Uas_uwILMmGkqoR1S1NCSHfygPHkBF0dY69AjLNhC40OJfGrMaaLaIBmojzKqaHm5_1BE-M7hV2HXJ40'
    }
  ]

  return (
    <div className="customer-theme dark bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
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
      <header className="fixed top-0 w-full z-50 bg-background-dark backdrop-blur-md border-b border-primary/10 px-6 lg:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-primary">
              <span className="material-symbols-outlined text-3xl">restaurant</span>
            </div>
            <h2 className="text-slate-100 text-xl font-bold tracking-widest">LUMIÈRE</h2>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <Link to="/home" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Home</Link>
            <Link to="/reservations" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Reservations</Link>
            <a href="/menu" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Menu</a>
            <a href="#" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-6">
            <Link to="/reservations" className="hidden sm:flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-all">
              Book Now
            </Link>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-primary/20" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAiOgEqohQsk5k_CZWwTHb05xpYZERL9tIaWeMXzexkFlioYAbgSGrrCmtubYeOLrU6aMWKZ0Ayp_YomlMFhsX5Cz7H6x9O9gYBOlyR0DwXsxgqytrPkK_Cbm8cPb5iSrDyKHfnBk222XmlKWxXNFWpUBmRU053GK4d-5XOW4d1SVdWk26TdxayJi5Wiia3_-CPzpcs1VPOiyHDsUdEzdsUZadeckdQkgTK5YhcSoD-ZCxL2xmVIiSSQZUXGRiKXMZ3sl78u6IC0Mc")'}}></div>
          </div>
        </div>
      </header>

      <main className="customer-theme dark bg-background-light dark:bg-background-dark flex flex-col lg:flex-row  mx-auto w-full grow px-4 md:px-10 py-20 gap-8">
        {/* Main Menu Content */}
        <div className="flex-1 space-y-8">
          {/* Hero Banner */}
          <div className="relative rounded-xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 bg-slate-900 shadow-2xl">
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZ9sv2Ovg-UPbxV8wVJJ8cAfSRh0KOwJEf0HtoowdCi7F8CXe75KewCSNMnqj7qCQ7EOMwVyLU3XILcLFTgqUU-F1VD_ROr8p96h6ehf9661YGjvMWa9IFbuI14FQ28_sQsKqiW4mtfKm6y8txDGNcfS4jg1Pe83bUOwXPZJtqbOioY85pCHJojPdbiohJGm8TzPGl8qPAIb5hOfX-PHMBv9_iFU2TBy5OGiIZ40kWg21vcWScsw6edwCYoImaBSBYPJ_YrR2z-KU")'}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-primary text-xs font-bold rounded-full mb-4">SEASONAL MENU</span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight">The Art of Fine Dining</h1>
              <p className="text-slate-300 max-w-xl text-lg">Experience a symphony of flavors crafted by Michelin-starred chefs using only the finest seasonal ingredients.</p>
            </div>
          </div>

          {/* Categories Tabs */}
          <div className="sticky top-[88px] z-40 bg-background-light dark:bg-background-dark py-4 border-b border-slate-200 dark:border-primary/10">
            <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
              <button className="flex-none border-b-2 border-primary text-primary pb-2 font-bold text-sm tracking-wide">APPETIZERS</button>
              <button className="flex-none border-b-2 border-transparent text-slate-500 hover:text-primary pb-2 font-bold text-sm tracking-wide transition-colors">MAIN COURSES</button>
              <button className="flex-none border-b-2 border-transparent text-slate-500 hover:text-primary pb-2 font-bold text-sm tracking-wide transition-colors">DESSERTS</button>
              <button className="flex-none border-b-2 border-transparent text-slate-500 hover:text-primary pb-2 font-bold text-sm tracking-wide transition-colors">FINE WINES</button>
              <button className="flex-none border-b-2 border-transparent text-slate-500 hover:text-primary pb-2 font-bold text-sm tracking-wide transition-colors">SIGNATURE COCKTAILS</button>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <div key={item.id} className="group flex flex-col bg-white dark:bg-primary/5 rounded-xl overflow-hidden border border-slate-200 dark:border-primary/10 hover:shadow-xl transition-all">
                <div className="h-56 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: `url("${item.image}")`}}></div>
                <div className="p-6 flex flex-col grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{item.name}</h3>
                    <span className="text-primary font-bold">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 grow">{item.description}</p>
                  <button onClick={() => addToBasket({...item, qty: 1, notes: '', id: Math.random()})} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-lg hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
                    Add to Basket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar / Gourmet Basket */}
        <aside className="w-full lg:w-96">
          <div className="sticky top-[88px] flex flex-col bg-white dark:bg-primary/5 rounded-2xl border border-slate-200 dark:border-primary/20 shadow-xl overflow-hidden min-h-[600px]">
            <div className="p-6 border-b border-slate-100 dark:border-primary/10 bg-slate-50 dark:bg-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>shopping_basket</span>
                  <h2 className="text-xl font-bold text-white">Gourmet Basket</h2>
                </div>
                <span className="px-2 py-1 bg-primary/20 text-red-600 text-xs font-bold rounded">{basket.length} ITEMS</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  45 mins
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Table 12
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {basket.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="size-20 rounded-lg bg-cover bg-center shrink-0" style={{backgroundImage: `url("${item.image}")`}}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <button onClick={() => removeFromBasket(item.id)} className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{item.notes}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="size-6 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">-</button>
                        <span className="text-sm font-bold text-stone-200">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="size-6 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">+</button>
                      </div>
                      <span className="text-sm font-bold text-stone-200">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-primary/10 border-t border-slate-200 dark:border-primary/20 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-primary/20">
                  <span className='text-zinc-300'>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                Complete Order
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">Prices exclude 12% service charge</p>
            </div>
          </div>
        </aside>
      </main>

      <footer className="mt-auto py-12 px-10 border-t border-slate-200 dark:border-primary/10 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 text-primary opacity-60 grayscale">
            <span className="text-white material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
            <h2 className="text-lg font-extrabold tracking-tight uppercase text-white">L'Élite</h2>
          </div>
          <div className="flex gap-8 text-slate-400 text-sm font-medium">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#">Allergens Information</a>
            <a className="hover:text-primary transition-colors" href="#">Contact</a>
          </div>
          <div className="flex gap-4">
            <a className="size-8 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all" href="#">
              <span className="material-symbols-outlined text-base">public</span>
            </a>
            <a className="size-8 rounded-full border border-slate-200 dark:border-primary/20 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all" href="#">
              <span className="material-symbols-outlined text-base">mail</span>
            </a>
          </div>
        </div>
        <p className="text-center text-slate-400 text-xs mt-8">© 2024 L'Élite Gastronomie. All rights reserved.</p>
      </footer>
    </div>
  )
}
