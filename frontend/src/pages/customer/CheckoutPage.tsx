import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
export default function CheckoutPage() {
  const navigate = useNavigate()

  return (
    <div className="customer-theme dark relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Top Navigation Bar */}
      {/* <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark px-10 py-4 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] font-display">L'Élite Gastronomique</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-9">
            <a className="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Menu</a>
            <a className="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Reservations</a>
            <a className="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Private Dining</a>
            <a className="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Gallery</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold transition-all hover:brightness-110">
              My Account
            </button>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-border-dark" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdaqAzLEW5-bUDClHWX-9vZMhqrMibK5UkiddSWU5ksriSLbzj4ODaRNbIm2hw_5R9xsuA06qbWKZpCPwXkKADmsAfXRJx_vZnoG3bG3AK8c_l9g35pkSvdTBgWOty__Gms4cIAzB7LsgDh9t7VL6QmAaZ1SknpM-UNMq1aXHsNAGAeYbtBAqocZ5JHMfMAKMp1V8DsabDbxIndC7L48LhQEiwtfdN4pk8TzgL9J4cqK7eGDWzpiGp1BYn_8l8rs-LMNTfDUOdlSg")'}} alt="User profile"></div>
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

      <main className="customer-theme dark bg-background-light dark:bg-background-dark flex-1 flex justify-center py-20 px-6 lg:px-40">
        <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Payment Details */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span><Link to="/home" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Home</Link></span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span><Link to="/reservations" className="text-slate-100 hover:text-primary text-sm font-medium transition-colors">Reservations</Link></span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-primary">Secure Checkout</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Secure Checkout</h1>
              <p className="text-slate-600 dark:text-slate-400">Complete your luxury dining reservation with confidence.</p>
            </div>

            {/* Payment Method Selection */}
            <section className="flex flex-col gap-6">
              <h2 className="text-xl font-bold dark:text-white">Payment Method</h2>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
                  <input defaultChecked className="hidden" name="payment" type="radio" />
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">credit_card</span>
                    <span className="font-bold text-sm">Credit Card</span>
                  </div>
                  <div className="size-4 rounded-full border-4 border-primary bg-white"></div>
                </label>
                <label className="relative flex items-center justify-between p-4 rounded-xl border border-border-dark bg-surface-dark/50 cursor-pointer hover:bg-surface-dark transition-colors">
                  <input className="hidden" name="payment" type="radio" />
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                    <span className="font-bold text-sm">Digital Wallet</span>
                  </div>
                  <div className="size-4 rounded-full border border-border-dark"></div>
                </label>
              </div>

              {/* Card Inputs */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Cardholder Name</label>
                  <input className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-accent-gold luxury-border outline-none transition-all" placeholder="ALEXANDER VANCE" type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Card Number</label>
                  <div className="relative">
                    <input className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-accent-gold luxury-border outline-none transition-all" placeholder="**** **** **** 8892" type="text" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                      <div className="w-8 h-5 bg-slate-700 rounded-sm"></div>
                      <div className="w-8 h-5 bg-slate-800 rounded-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Expiry Date</label>
                    <input className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-accent-gold luxury-border outline-none transition-all" placeholder="MM/YY" type="text" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">CVV</label>
                    <input className="w-full bg-surface-dark border border-border-dark rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-accent-gold luxury-border outline-none transition-all" placeholder="***" type="password" />
                  </div>
                </div>
              </div>
            </section>

            {/* Security Badge */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-border-dark/30">
              <span className="material-symbols-outlined text-emerald-500 text-3xl">verified_user</span>
              <div>
                <p className="text-sm font-bold dark:text-white">Encrypted & Secure</p>
                <p className="text-xs text-slate-500">Your connection is secured with 256-bit SSL encryption. We do not store your full card details.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-surface-dark rounded-2xl border border-border-dark p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 font-display">Order Summary</h2>
              <div className="space-y-6">
                {/* Experience Section */}
                <div className="flex gap-4 pb-6 border-b border-border-dark">
                  <div className="size-20 rounded-lg overflow-hidden shrink-0">
                    <img className="w-full h-full object-cover" alt="High-end restaurant interior" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkJYVkM1-wzHyEA7R793kb2iu6EdvYLj_4hUkCS74efZkedS4Llb_iyZmobsMizcBId8Uei1MK8FulVFcejoLY6QEb16t_J9J5vMxYtW6B6a6QvfJVZ2i3VAiwIFbb-WWSKG6XHNw6EO4w6Yra_4vWQyFsxH4JkfXJt3Y8wguWmXNBJr9wPF3NutfBJTKQ8oeu_LzoSNlUhmlqMbKWvJMzDUIWp5o003N055mnqoVNbrrxQqB19sSwXUPpOuoYYNpQ10Uid4iM6-w" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-white font-bold">The Grand Hall Experience</p>
                    <p className="text-slate-400 text-sm italic">Friday, Oct 24 • 8:30 PM</p>
                    <p className="text-slate-400 text-sm">Table for Two</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Signature Tasting Menu (x2)</span>
                    <span className="text-white font-medium">$500.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Vintage Wine Pairing (x2)</span>
                    <span className="text-white font-medium">$300.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Service Charge (10%)</span>
                    <span className="text-white font-medium">$80.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Booking Fee</span>
                    <span className="text-white font-medium">$15.00</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-6 border-t border-border-dark">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Total Amount</p>
                      <p className="text-accent-gold text-4xl font-black">$895.00</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-[10px] uppercase font-bold">Inclusive of taxes</p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/')} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">lock</span>
                    Complete Reservation & Payment
                  </button>
                  <p className="text-center text-[11px] text-slate-500 mt-4 leading-relaxed">
                    By clicking the button above, you agree to our <a className="underline" href="#">Terms of Service</a> and <a className="underline" href="#">Cancellation Policy</a>. A confirmation email will be sent immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-border-dark mt-auto bg-background-dark">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs">© 2024 L'Élite Gastronomique. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">language</span></a>
            <a className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">help</span></a>
            <a className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">policy</span></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
