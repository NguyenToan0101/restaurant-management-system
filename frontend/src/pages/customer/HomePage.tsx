import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="customer-theme dark bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background-dark/80 backdrop-blur-md border-b border-primary/10 px-6 lg:px-20 py-4">
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
      

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 via-background-dark/40 to-background-dark z-10"></div>
            <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCedfJYcCgEckrl9XByGkW8WXxhknt7j5G3bhEiUfdQwSzW_YhTj3VOfEZfkyR7tfDwfMC5QgL4NGKDufekDXqQW8wL8RH17jBXJIkqhpfGsMejWFAYlF8oa2VR8mHiL9LCs2v6olsO67XNu5Qgf-7kN1uIm-avgUwEZ-_OTgvQG8f-MnbP_nsBUY40m4HixJfqFHii_zWj2u-C-tglUVNon1n-QNlEowOUmPAGwQJVLB6JFtvEYMgGuhVE53WjBJx9RhRM1IBA684")'}}></div>
          </div>
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
            <span className="text-accent-gold tracking-[0.3em] text-xs font-bold uppercase mb-6 block">Michelin Starred Excellence</span>
            <h1 className="text-white text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-8">
              Artistry on Every <span className="text-primary italic">Plate.</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl mx-auto">
              A symphony of seasonal flavors served in an atmosphere of pure sophistication. Discover the definitive fine dining experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/reservations" className="w-full sm:w-auto min-w-[200px] h-14 bg-primary text-white rounded-lg font-bold text-base hover:scale-105 transition-transform flex items-center justify-center">
                Secure a Table
              </Link>
              <Link to="/menu" className="w-full sm:w-auto min-w-[200px] h-14 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg font-bold text-base hover:bg-white/20 transition-all flex items-center justify-center">
                View Menu
              </Link>
            </div>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <span className="material-symbols-outlined text-white/50 text-3xl">expand_more</span>
          </div>
        </section>

        {/* Signature Experience */}
        <section className="py-24 px-6 lg:px-20 bg-background-light dark:bg-background-dark">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-xl">
                <h2 className="text-primary font-bold tracking-widest text-sm uppercase mb-3">The Signature Menu</h2>
                <h3 className="text-4xl md:text-5xl font-bold dark:text-white leading-tight">Masterpieces crafted by Chef de Cuisine</h3>
              </div>
              <Link to="/menu" className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
                EXPLORE FULL MENU <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Menu Item 1 */}
              <div className="group cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-6">
                  <div className="absolute inset-0 bg-background-dark/20 group-hover:bg-background-dark/0 transition-all duration-500"></div>
                  <img alt="Aged Wagyu Tartare" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtI2Y-jYUmODO4n7UiZP85i3CNBMvxw_ir7uI-6HjGjp-d6s4MAeAYy6FdtOaAtgcV2aFXd6sOFnYxg7FMyQRxa1x1o1ZbfE8_FFspos7wdk8huRn92Xky8s_gaYup4Drr5jGjSSVrM3cJnOLixer_XWvfCQFDWDEDa37uF0OVruY91hh4_Qjf07MX8O7D_WML3VHPWovExn8xJ2hixcyL-FlOp3g5Guk7msvp30QftzjHLtDWWyGlg6O3Z_T-NfBLOJRm5V9-8GI" />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">$42</div>
                </div>
                <h4 className="text-xl font-bold dark:text-white mb-2 group-hover:text-primary transition-colors">Aged Wagyu Tartare</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Smoked egg yolk, truffle emulsion, and house-made sourdough crisps.</p>
              </div>

              {/* Menu Item 2 */}
              <div className="group cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-6">
                  <div className="absolute inset-0 bg-background-dark/20 group-hover:bg-background-dark/0 transition-all duration-500"></div>
                  <img alt="Wild Atlantic Scallops" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwVwVCy1b_j5FCaXE2OoG58dDzA-dqzL6dNRRzL05A68HAbf13p14o1_pe2Mbwgw_42WhILu8tK801C3xekCvVHLdukuNcHwvfiZvQcbFglmalIuQlOezSfymMxZYJFKbniYlaDYDpjiQTfEeJm6RGXykKGBmHYPY8V9eZ51aaxvxdGJyPjxBSqL6dAWzWLRjBLISXFotEfTBpKj5oK6kJEIYORH5D-DYejFVbiDQjpLMDb7IM9kXI58JpTytJ3vtv3SqmAxAiSsg" />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">$38</div>
                </div>
                <h4 className="text-xl font-bold dark:text-white mb-2 group-hover:text-primary transition-colors">Wild Atlantic Scallops</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Pan-seared with cauliflower silk, brown butter, and caper berries.</p>
              </div>

              {/* Menu Item 3 */}
              <div className="group cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-6">
                  <div className="absolute inset-0 bg-background-dark/20 group-hover:bg-background-dark/0 transition-all duration-500"></div>
                  <img alt="Saffron Infused Risotto" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3oNXGVMy4rloibPh3LN3q6-KYrDCpEpdZpRMKgTBGauxaaWLJrYCCSgbaQSMb5xEQPYNlJCCJGHI9njcdvafn_lN2vi-dtM4mwBUJCYQOxMfSatvhJDlfbHRzH1S5nGa4Z1LsapWv61aJ0mQ-P6UkLCGcWQeFaD9ufPpWoww1XFFFXMlMjTKtWnrCwWSz1KaM0rpZycSu78CNwrfaITRkTcaMyCODgmkeju_mDPb_mwAIiERSiGV21lRHw3Ti7qa4ECpqFZb7zDI" />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">$35</div>
                </div>
                <h4 className="text-xl font-bold dark:text-white mb-2 group-hover:text-primary transition-colors">Saffron Risotto</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Carnaroli rice, 24-month Parmigiano Reggiano, and edible gold.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reservation CTA Section */}
        <section className="customer-theme dark bg-background-light dark:bg-background-dark py-20 px-6">
          <div className="customer-theme dark max-w-7xl mx-auto bg-primary/10 rounded-3xl overflow-hidden border border-primary/20 flex flex-col lg:flex-row">
            <div className="p-10 lg:p-20 lg:w-1/2">
              <h2 className="text-4xl font-bold dark:text-white mb-6">Reserve Your Private Table</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg leading-relaxed">
                Experience an evening of unparalleled service and culinary delight. We recommend booking at least 14 days in advance for weekend service.
              </p>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Date</label>
                    <input className="w-full bg-background-dark border border-primary/20 rounded-lg text-slate-100 focus:ring-primary focus:border-primary" type="date" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Guests</label>
                    <select className="w-full bg-background-dark border border-primary/20 rounded-lg text-slate-100 focus:ring-primary focus:border-primary">
                      <option>2 People</option>
                      <option>4 People</option>
                      <option>6+ People (Private Room)</option>
                    </select>
                  </div>
                </div>
                <button className="w-full h-14 bg-primary text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all" type="submit">
                  Check Availability
                </button>
              </form>
            </div>
            <div className="lg:w-1/2 relative min-h-[400px]">
              <img alt="Dining Interior" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCGTmdlJZxA5ys-Lpb0gZWTZB3t0lyvxB47pjyCfTpmdtTeXW7BNyOCq01fA8ldELOJVzQ3Fb0OHO7Z7LpDE0tYqF70fQSOuNgfoKSS56FlQwaOaAlamYW3MTczldOauY6tkD_RaNWGtSqIJlA7lDN_5A6vwpwTSJrh4VBGrpozpTnEzOBpZDvMjYVD3wjqEzJr4675qDpj0AOSIijOoStNqXIIvTyvslFSQF8LjuBomVfHVIFqLmriVcV0rvbc3x6suV8GzFIYHc" />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background-dark border-t border-primary/10 py-16 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl">restaurant</span>
              <h2 className="text-white text-lg font-bold tracking-widest">LUMIÈRE</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Celebrating the art of gastronomy since 1994. Every ingredient tells a story, every dish is a memory.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/menu" className="hover:text-primary transition-colors">Our Menu</Link></li>
              <li><a className="hover:text-primary transition-colors" href="#">Wine List</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Private Events</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                1221 Avenue of the Arts, NY
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">call</span>
                +1 (555) 888-2300
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                reservations@lumiere.com
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-sm text-slate-400 mb-4">Join our list for exclusive seasonal tasting invites.</p>
            <div className="flex gap-2">
              <input className="bg-primary/5 border border-primary/20 rounded-lg text-sm w-full focus:ring-primary text-slate-100" placeholder="Your email" type="email" />
              <button className="bg-primary text-white p-2 rounded-lg">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-widest">
          <p>© 2024 Lumière Fine Dining Group. All rights reserved.</p>
          <div className="flex gap-8">
            <a className="hover:text-primary" href="#">Privacy Policy</a>
            <a className="hover:text-primary" href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
