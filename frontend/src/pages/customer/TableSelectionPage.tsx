import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function TableSelectionPage() {
  const navigate = useNavigate()
  const [selectedTable, setSelectedTable] = useState('B1')

  return (
    <div className="customer-theme dark bg-background-light dark:bg-background-dark relative flex flex-col min-h-screen w-full overflow-x-hidden ">
      {/* Navigation */}
      {/*<header className="flex items-center justify-between border-b border-primary/20 px-10 py-4 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
        
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <span className="material-symbols-outlined text-4xl">restaurant_menu</span>
          </div>
          <h2 className="text-slate-100 text-xl font-bold leading-tight tracking-tight uppercase">Lumière Dining</h2>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-slate-300 hover:text-primary text-sm font-medium transition-colors">Menu</Link>
          <Link to="/reservations" className="text-primary text-sm font-semibold border-b-2 border-primary pb-1">Reservations</Link>
          <a href="#" className="text-slate-300 hover:text-primary text-sm font-medium transition-colors">Events</a>
          <a href="#" className="text-slate-300 hover:text-primary text-sm font-medium transition-colors">Experience</a>
        </nav>
        <div className="flex items-center gap-6">
          <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            Book Table
          </button>
          <div className="rounded-full size-10 border border-primary/30 p-0.5">
            <div className="w-full h-full rounded-full bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA5akv6X9Uv5E6dAWRMAiA8TpDTv_B8aBYr_9rHA2s12MedQm1x0tNCj98uXdtDWApCLnCdLu6IbWuddXztnZ2qaGh4H2cyHhtKOErm_hIdlCZCPHp0HFwD8Gd75Bpy4YJLgtCWiG1XrX1g2xr0guUGTSeGavbZEvfAgl4ZDFFV8Q2-_5S59Y4qWJKJ_JbL8GPyJCw7-CrjHaFm6K6C7TnXNpRk__M9_-CU_Jfd-h73wWF1b-L_9kwIa80iJHHzNLGj6KYtlNMAEC0")'}}></div>
          </div>
        </div>
      </header> */}
      <header className="relative top-0 w-full z-50 bg-background-dark backdrop-blur-md border-b border-primary/10 px-6 lg:px-20 py-4">
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

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Interactive Floor Plan Area */}
        <div className="flex-1 relative overflow-hidden bg-background-dark p-8 floorplan-grid flex flex-col">
          <div className="flex flex-col mb-8">
            <nav className="flex gap-2 text-xs font-medium text-slate-500 mb-2">
              <span className="hover:text-primary cursor-pointer">Reservations</span>
              <span>/</span>
              <span className="text-slate-300">Table Selection</span>
            </nav>
            <h1 className="text-3xl font-black text-slate-100">Choose Your Experience</h1>
            <p className="text-slate-400 mt-1 max-w-lg">Select a table from our architectural floor plan to secure your preferred atmosphere.</p>
          </div>

          {/* Floor Plan Map Container */}
          <div className="flex-1 bg-background-dark/40 border border-primary/10 rounded-xl relative shadow-inner overflow-auto flex items-center justify-center p-12">
            <div className="relative w-[800px] h-[500px] border-2 border-slate-700/50 rounded-2xl p-8 bg-background-dark/60">
              {/* Entrance Label */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 px-4 py-1 rounded border border-slate-600 text-[10px] uppercase tracking-widest text-slate-400">Main Entrance</div>

              {/* Window Seat Section */}
              <div className="absolute top-0 right-0 left-0 h-12 border-b border-dashed border-slate-700 flex items-center justify-center gap-12">
                <div className="text-[10px] uppercase text-slate-500 tracking-[0.2em]">Panoramic Window View</div>
              </div>

              {/* Floor Plan Layout */}
              <div className="grid grid-cols-4 grid-rows-3 gap-16 mt-12">
                {/* Table Window 1 */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('W1')}>
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined absolute -top-4 text-slate-600">chair_alt</span>
                    <span className="material-symbols-outlined absolute -bottom-4 text-slate-600">chair_alt</span>
                    <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'W1' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>W1</div>
                  </div>
                </div>

                {/* Table Window 2 */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('W2')}>
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined absolute -top-4 text-slate-600">chair_alt</span>
                    <span className="material-symbols-outlined absolute -bottom-4 text-slate-600">chair_alt</span>
                    <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'W2' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>W2</div>
                  </div>
                </div>

                {/* Table Booth 1 */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('B1')}>
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined absolute -left-6 text-slate-600">chair_alt</span>
                    <span className="material-symbols-outlined absolute -right-6 text-slate-600">chair_alt</span>
                    <div className={`w-20 h-14 rounded-full border-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center text-xs font-bold italic transition-all ${selectedTable === 'B1' ? 'border-accent-gold bg-accent-gold text-background-dark' : 'border-accent-gold/50 bg-slate-800/50'}`}>
                      B1
                      {selectedTable === 'B1' && (
                        <div className="absolute -top-2 -right-2 bg-accent-gold text-background-dark rounded-full size-5 flex items-center justify-center text-[10px] font-black border-2 border-background-dark">
                          <span className="material-symbols-outlined text-[12px]">check</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table Window 3 */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('W3')}>
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined absolute -top-4 text-slate-600">chair_alt</span>
                    <span className="material-symbols-outlined absolute -bottom-4 text-slate-600">chair_alt</span>
                    <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'W3' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>W3</div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('C1')}>
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined absolute -left-4 text-slate-600">chair_alt</span>
                    <span className="material-symbols-outlined absolute -right-4 text-slate-600">chair_alt</span>
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'C1' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>C1</div>
                  </div>
                </div>

                {/* Bar Area Overlay */}
                <div className="col-span-2 row-span-1 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-600 mr-2">local_bar</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Artisan Bar Area</span>
                </div>

                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('C2')}>
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined absolute -left-4 text-slate-600">chair_alt</span>
                    <span className="material-symbols-outlined absolute -right-4 text-slate-600">chair_alt</span>
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'C2' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>C2</div>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined absolute -left-6 text-slate-600 rotate-90">chair_alt</span>
                    <div className="w-14 h-24 rounded-lg bg-slate-800/30 border-2 border-slate-700 flex items-center justify-center text-slate-600 cursor-not-allowed">
                      <span className="text-xs font-bold opacity-40">P1</span>
                    </div>
                    <span className="absolute text-[8px] bg-slate-700 px-1 rounded text-slate-300">BOOKED</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('C3')}>
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined absolute -left-4 text-slate-600">chair_alt</span>
                    <span className="material-symbols-outlined absolute -right-4 text-slate-600">chair_alt</span>
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'C3' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>C3</div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('C4')}>
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined absolute -left-4 text-slate-600">chair_alt</span>
                    <span className="material-symbols-outlined absolute -right-4 text-slate-600">chair_alt</span>
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'C4' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>C4</div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined absolute -right-6 text-slate-600 -rotate-90">chair_alt</span>
                    <div className="w-14 h-24 rounded-lg bg-slate-800/30 border-2 border-slate-700 flex items-center justify-center text-slate-600 cursor-not-allowed">
                      <span className="text-xs font-bold opacity-40">P2</span>
                    </div>
                    <span className="absolute text-[8px] bg-slate-700 px-1 rounded text-slate-300">BOOKED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 flex gap-4 bg-background-dark/80 backdrop-blur p-3 rounded-lg border border-primary/10">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-slate-800 border border-primary/40"></div>
              <span className="text-[10px] text-slate-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-accent-gold"></div>
              <span className="text-[10px] text-slate-400">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-slate-700 opacity-50"></div>
              <span className="text-[10px] text-slate-400">Occupied</span>
            </div>
          </div>
        </div>

        {/* Sidebar Details */}
        <aside className="w-full lg:w-96 bg-background-dark border-l border-primary/20 flex flex-col">
          <div className="p-6 border-b border-primary/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">event_seat</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Selection Details</h3>
                <p className="text-xs text-slate-500">Table #{selectedTable} - {selectedTable.startsWith('B') ? 'Velvet Booth' : selectedTable.startsWith('W') ? 'Window Seat' : 'Center Table'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-tighter text-slate-500">Category</span>
                  <span className="text-xs font-bold text-accent-gold">{selectedTable.startsWith('B') ? 'Premium Booth' : 'Standard Seating'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-tighter text-slate-500">Capacity</span>
                  <span className="text-xs font-bold text-slate-200">{selectedTable.startsWith('B') ? '2-4 Guests' : '2-3 Guests'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">visibility</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">Central View</p>
                    <p className="text-[10px] text-slate-500">Perfect view of the open kitchen</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">volume_off</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">Quiet Zone</p>
                    <p className="text-[10px] text-slate-500">Tucked away for private conversation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/20 border border-primary/30">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">Sommelier Choice</p>
                    <p className="text-[10px] text-primary/70">Includes complimentary tasting pour</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-4">
            <div className="mt-auto space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 px-1">Special Occasion</label>
                <select defaultValue="Just Dining" className="bg-background-dark border border-slate-700 rounded-lg text-sm text-slate-300 focus:ring-primary focus:border-primary">
                  <option>Anniversary</option>
                  <option>Birthday</option>
                  <option>Business Dinner</option>
                  <option >Just Dining</option>
                </select>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-sm">Reservation Fee</span>
                  <span className="text-slate-200 font-bold">$25.00</span>
                </div>
                <p className="text-[10px] text-slate-500 italic">Fee is deducted from your final bill</p>
              </div>
              <button onClick={() => navigate('/menu')} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group">
                Confirm Selection
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button onClick={() => navigate(-1)} className="w-full bg-transparent text-slate-400 py-3 rounded-xl font-medium text-xs hover:text-slate-100 transition-colors">
                Go Back
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
