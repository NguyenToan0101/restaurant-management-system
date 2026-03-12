import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { restaurantApi, branchApi, areaApi, areaTableApi, reservationApi } from '@/api'
import type { RestaurantDTO, BranchDTO, AreaDTO, AreaTableDTO } from '@/types/dto'

export default function TableSelectionPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug?: string }>()

  const [restaurant, setRestaurant] = useState<RestaurantDTO | null>(null)
  const [branches, setBranches] = useState<BranchDTO[]>([])
  const [areas, setAreas] = useState<AreaDTO[]>([])
  const [tables, setTables] = useState<AreaTableDTO[]>([])
  
  const [selectedBranch, setSelectedBranch] = useState<BranchDTO | null>(null)
  const [selectedArea, setSelectedArea] = useState<AreaDTO | null>(null)
  const [selectedTable, setSelectedTable] = useState<AreaTableDTO | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'branch' | 'details' | 'area' | 'table'>('branch')
  
  const [reservationData, setReservationData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    guestNumber: 2,
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '19:00',
    specialOccasion: 'Just Dining',
    notes: ''
  })

  // Fetch restaurant and branches
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const restaurantSlug = slug || 'default'
        
        try {
          const restaurantData = await restaurantApi.getBySlug(restaurantSlug)
          setRestaurant(restaurantData)
          
          const branchesData = await branchApi.getByPublicRestaurant(restaurantData.restaurantId)
          setBranches(branchesData)
          if (branchesData.length > 0) {
            setSelectedBranch(branchesData[0])
          }
        } catch (err) {
          console.error('Error fetching restaurant:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  // Fetch areas when branch changes
  useEffect(() => {
    const fetchAreas = async () => {
      if (selectedBranch) {
        try {
          const areasData = await areaApi.getByBranch(selectedBranch.branchId || '')
          setAreas(areasData)
          if (areasData.length > 0) {
            setSelectedArea(areasData[0])
          }
        } catch (err) {
          console.error('Error fetching areas:', err)
        }
      }
    }

    fetchAreas()
  }, [selectedBranch])

  // Fetch tables when area changes
  useEffect(() => {
    const fetchTables = async () => {
      if (selectedArea) {
        try {
          const tablesData = await areaTableApi.getByArea(selectedArea.areaId)
          setTables(tablesData)
          setSelectedTable(null)
        } catch (err) {
          console.error('Error fetching tables:', err)
        }
      }
    }

    fetchTables()
  }, [selectedArea])

  const handleReservationSubmit = async () => {
    if (!selectedBranch || !selectedTable || !reservationData.customerName || !reservationData.customerPhone || !reservationData.customerEmail) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const startTime = `${reservationData.reservationDate}T${reservationData.reservationTime}:00`
      
      const reservation = await reservationApi.create({
        branchId: selectedBranch.branchId || '',
        areaTableId: selectedTable.areaTableId,
        startTime,
        customerName: reservationData.customerName,
        customerPhone: reservationData.customerPhone,
        customerEmail: reservationData.customerEmail,
        guestNumber: reservationData.guestNumber,
        note: `${reservationData.specialOccasion} - ${reservationData.notes}`
      })

      // Show success and redirect to menu
      alert('Reservation confirmed! Proceeding to menu...')
      navigateTo('/menu')
    } catch (err) {
      console.error('Error creating reservation:', err)
      alert('Failed to create reservation. Please try again.')
    }
  }

  const navigateTo = (path: string) => {
    if (slug) {
      navigate(`/${slug}${path}`)
    } else {
      navigate(path)
    }
  }

  if (loading) {
    return (
      <div className="customer-theme dark bg-background-dark flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-300">Loading reservation system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-theme dark bg-background-light dark:bg-background-dark relative flex flex-col min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <header className="relative top-0 w-full z-50 bg-background-dark backdrop-blur-md border-b border-primary/10 px-6 lg:px-20 py-4">
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
            <Link to={slug ? `/${slug}/menu` : '/menu'} className="hidden sm:flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-all">
              View Menu
            </Link>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-primary/20" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAiOgEqohQsk5k_CZWwTHb05xpYZERL9tIaWeMXzexkFlioYAbgSGrrCmtubYeOLrU6aMWKZ0Ayp_YomlMFhsX5Cz7H6x9O9gYBOlyR0DwXsxgqytrPkK_Cbm8cPb5iSrDyKHfnBk222XmlKWxXNFWpUBmRU053GK4d-5XOW4d1SVdWk26TdxayJi5Wiia3_-CPzpcs1VPOiyHDsUdEzdsUZadeckdQkgTK5YhcSoD-ZCxL2xmVIiSSQZUXGRiKXMZ3sl78u6IC0Mc")'}}></div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden bg-background-dark p-8 floorplan-grid flex flex-col">
          <div className="mb-8">
            <nav className="flex gap-2 text-xs font-medium text-slate-500 mb-4">
              <span className="text-slate-300">Reservations</span>
              <span>/</span>
              <span className="text-primary">{step === 'branch' ? 'Branch' : step === 'details' ? 'Details' : step === 'area' ? 'Area' : 'Table'}</span>
            </nav>
            <h1 className="text-3xl font-black text-slate-100">
              {step === 'branch' && 'Select Branch'}
              {step === 'details' && 'Reservation Details'}
              {step === 'area' && 'Select Dining Area'}
              {step === 'table' && 'Choose Your Table'}
            </h1>
            <p className="text-slate-400 mt-1 max-w-lg">
              {step === 'branch' && 'Choose a branch location to get started'}
              {step === 'details' && 'Enter your reservation information'}
              {step === 'area' && 'Select your preferred dining area'}
              {step === 'table' && 'Select your preferred table'}
            </p>
          </div>

          {/* Step 1: Branch Selection */}
          {step === 'branch' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                {branches.map(branch => (
                  <div
                    key={branch.branchId}
                    onClick={() => {
                      setSelectedBranch(branch)
                      setStep('details')
                    }}
                    className="p-6 rounded-xl border-2 border-primary/30 hover:border-primary bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-all hover:scale-105"
                  >
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-3xl text-primary">location_on</span>
                      <div>
                        <h3 className="font-bold text-white text-lg">{branch.address}</h3>
                        <p className="text-sm text-slate-400">{branch.branchPhone}</p>
                        <p className="text-xs text-slate-500 mt-1">{branch.openingTime} - {branch.closingTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Reservation Details */}
          {step === 'details' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-2xl space-y-6 bg-slate-800/50 p-8 rounded-2xl border border-primary/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={reservationData.customerName}
                      onChange={(e) => setReservationData({ ...reservationData, customerName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-primary focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={reservationData.customerPhone}
                      onChange={(e) => setReservationData({ ...reservationData, customerPhone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-primary focus:outline-none"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={reservationData.customerEmail}
                      onChange={(e) => setReservationData({ ...reservationData, customerEmail: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-primary focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Number of Guests *</label>
                    <select
                      value={reservationData.guestNumber}
                      onChange={(e) => setReservationData({ ...reservationData, guestNumber: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-primary focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} Guest{num !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Reservation Date *</label>
                    <input
                      type="date"
                      value={reservationData.reservationDate}
                      onChange={(e) => setReservationData({ ...reservationData, reservationDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-primary focus:outline-none"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Reservation Time *</label>
                    <input
                      type="time"
                      value={reservationData.reservationTime}
                      onChange={(e) => setReservationData({ ...reservationData, reservationTime: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Special Occasion</label>
                  <select
                    value={reservationData.specialOccasion}
                    onChange={(e) => setReservationData({ ...reservationData, specialOccasion: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-primary focus:outline-none"
                  >
                    <option>Just Dining</option>
                    <option>Anniversary</option>
                    <option>Birthday</option>
                    <option>Business Dinner</option>
                    <option>Proposal</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Special Requests</label>
                  <textarea
                    value={reservationData.notes}
                    onChange={(e) => setReservationData({ ...reservationData, notes: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-primary focus:outline-none h-24 resize-none"
                    placeholder="Any special requests or dietary requirements?"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep('branch')}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-white hover:bg-slate-700 transition-colors border border-slate-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('area')}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Area Selection */}
          {step === 'area' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                {areas.map(area => (
                  <div
                    key={area.areaId}
                    onClick={() => {
                      setSelectedArea(area)
                      setStep('table')
                    }}
                    className="p-6 rounded-xl border-2 border-primary/30 hover:border-primary bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-all hover:scale-105 text-center"
                  >
                    <span className="material-symbols-outlined text-4xl text-primary block mb-3">map</span>
                    <h3 className="font-bold text-white text-lg">{area.name}</h3>
                    <p className="text-sm text-slate-400 mt-2">{area.description || 'Select this area'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Table Selection */}
          {step === 'table' && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {tables.map(table => (
                  <div
                    key={table.areaTableId}
                    onClick={() => setSelectedTable(table)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                      selectedTable?.areaTableId === table.areaTableId
                        ? 'border-primary bg-primary/20'
                        : table.status === 'AVAILABLE'
                        ? 'border-primary/40 hover:border-primary bg-slate-800/50'
                        : 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                    }`}
                    style={{opacity: table.status !== 'AVAILABLE' ? 0.5 : 1}}
                  >
                    <span className="material-symbols-outlined text-3xl text-primary block mb-2">event_seat</span>
                    <h3 className="font-bold text-white">{table.tag}</h3>
                    <p className="text-xs text-slate-400">Capacity: {table.capacity}</p>
                    <p className="text-xs text-slate-500 mt-1 uppercase">{table.status}</p>
                  </div>
                ))}
              </div>

              {selectedTable && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 max-w-md w-full mb-6">
                  <div className="text-center">
                    <p className="text-slate-300 text-sm mb-2">Selected Table</p>
                    <h2 className="text-3xl font-bold text-primary mb-4">{selectedTable.tag}</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-slate-400 text-xs">Capacity</p>
                        <p className="text-white font-bold">{selectedTable.capacity} guests</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Status</p>
                        <p className="text-green-400 font-bold">Available</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 w-full max-w-md">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white hover:bg-slate-700 transition-colors border border-slate-600"
                >
                  Back
                </button>
                <button
                  onClick={handleReservationSubmit}
                  disabled={!selectedTable}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  Complete Reservation <span className="material-symbols-outlined">check</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-96 bg-background-dark border-l border-primary/20 flex flex-col p-6">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Summary</h3>
            
            {selectedBranch && (
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 mb-4">
                <p className="text-xs text-slate-500 uppercase mb-1">Branch</p>
                <p className="text-white font-semibold">{selectedBranch.address}</p>
              </div>
            )}

            {reservationData.customerName && (
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 mb-4">
                <p className="text-xs text-slate-500 uppercase mb-1">Name</p>
                <p className="text-white font-semibold">{reservationData.customerName}</p>
              </div>
            )}

            {reservationData.reservationDate && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-xs text-slate-500 uppercase mb-1">Date</p>
                  <p className="text-white font-semibold">{reservationData.reservationDate}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-xs text-slate-500 uppercase mb-1">Time</p>
                  <p className="text-white font-semibold">{reservationData.reservationTime}</p>
                </div>
              </div>
            )}

            {reservationData.guestNumber && (
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 mb-4">
                <p className="text-xs text-slate-500 uppercase mb-1">Guests</p>
                <p className="text-white font-semibold">{reservationData.guestNumber} people</p>
              </div>
            )}

            {selectedArea && (
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 mb-4">
                <p className="text-xs text-slate-500 uppercase mb-1">Area</p>
                <p className="text-white font-semibold">{selectedArea.name}</p>
              </div>
            )}

            {selectedTable && (
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <p className="text-xs text-slate-500 uppercase mb-1">Table</p>
                <p className="text-white font-semibold">{selectedTable.tag}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigateTo('/menu')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold text-sm transition-colors"
          >
            Browse Menu
          </button>
        </aside>
      </main>
    </div>
  )
}

//   return (
//     <div className="customer-theme dark bg-background-light dark:bg-background-dark relative flex flex-col min-h-screen w-full overflow-x-hidden ">
//       {/* Navigation */}
//       {/*<header className="flex items-center justify-between border-b border-primary/20 px-10 py-4 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
        
//         <div className="flex items-center gap-3">
//           <div className="text-primary">
//             <span className="material-symbols-outlined text-4xl">restaurant_menu</span>
//           </div>
//           <h2 className="text-slate-100 text-xl font-bold leading-tight tracking-tight uppercase">Lumière Dining</h2>
//         </div>
//         <nav className="hidden md:flex items-center gap-10">
//           <Link to="/" className="text-slate-300 hover:text-primary text-sm font-medium transition-colors">Menu</Link>
//           <Link to="/reservations" className="text-primary text-sm font-semibold border-b-2 border-primary pb-1">Reservations</Link>
//           <a href="#" className="text-slate-300 hover:text-primary text-sm font-medium transition-colors">Events</a>
//           <a href="#" className="text-slate-300 hover:text-primary text-sm font-medium transition-colors">Experience</a>
//         </nav>
//         <div className="flex items-center gap-6">
//           <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
//             Book Table
//           </button>
//           <div className="rounded-full size-10 border border-primary/30 p-0.5">
//             <div className="w-full h-full rounded-full bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA5akv6X9Uv5E6dAWRMAiA8TpDTv_B8aBYr_9rHA2s12MedQm1x0tNCj98uXdtDWApCLnCdLu6IbWuddXztnZ2qaGh4H2cyHhtKOErm_hIdlCZCPHp0HFwD8Gd75Bpy4YJLgtCWiG1XrX1g2xr0guUGTSeGavbZEvfAgl4ZDFFV8Q2-_5S59Y4qWJKJ_JbL8GPyJCw7-CrjHaFm6K6C7TnXNpRk__M9_-CU_Jfd-h73wWF1b-L_9kwIa80iJHHzNLGj6KYtlNMAEC0")'}}></div>
//           </div>
//         </div>
//       </header> */}
//       <header className="relative top-0 w-full z-50 bg-background-dark backdrop-blur-md border-b border-primary/10 px-6 lg:px-20 py-4">
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

//       <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-73px)]">
//         {/* Interactive Floor Plan Area */}
//         <div className="flex-1 relative overflow-hidden bg-background-dark p-8 floorplan-grid flex flex-col">
//           <div className="flex flex-col mb-8">
//             <nav className="flex gap-2 text-xs font-medium text-slate-500 mb-2">
//               <span className="hover:text-primary cursor-pointer">Reservations</span>
//               <span>/</span>
//               <span className="text-slate-300">Table Selection</span>
//             </nav>
//             <h1 className="text-3xl font-black text-slate-100">Choose Your Experience</h1>
//             <p className="text-slate-400 mt-1 max-w-lg">Select a table from our architectural floor plan to secure your preferred atmosphere.</p>
//           </div>

//           {/* Floor Plan Map Container */}
//           <div className="flex-1 bg-background-dark/40 border border-primary/10 rounded-xl relative shadow-inner overflow-auto flex items-center justify-center p-12">
//             <div className="relative w-[800px] h-[500px] border-2 border-slate-700/50 rounded-2xl p-8 bg-background-dark/60">
//               {/* Entrance Label */}
//               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 px-4 py-1 rounded border border-slate-600 text-[10px] uppercase tracking-widest text-slate-400">Main Entrance</div>

//               {/* Window Seat Section */}
//               <div className="absolute top-0 right-0 left-0 h-12 border-b border-dashed border-slate-700 flex items-center justify-center gap-12">
//                 <div className="text-[10px] uppercase text-slate-500 tracking-[0.2em]">Panoramic Window View</div>
//               </div>

//               {/* Floor Plan Layout */}
//               <div className="grid grid-cols-4 grid-rows-3 gap-16 mt-12">
//                 {/* Table Window 1 */}
//                 <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('W1')}>
//                   <div className="relative flex items-center justify-center">
//                     <span className="material-symbols-outlined absolute -top-4 text-slate-600">chair_alt</span>
//                     <span className="material-symbols-outlined absolute -bottom-4 text-slate-600">chair_alt</span>
//                     <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'W1' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>W1</div>
//                   </div>
//                 </div>

//                 {/* Table Window 2 */}
//                 <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('W2')}>
//                   <div className="relative flex items-center justify-center">
//                     <span className="material-symbols-outlined absolute -top-4 text-slate-600">chair_alt</span>
//                     <span className="material-symbols-outlined absolute -bottom-4 text-slate-600">chair_alt</span>
//                     <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'W2' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>W2</div>
//                   </div>
//                 </div>

//                 {/* Table Booth 1 */}
//                 <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('B1')}>
//                   <div className="relative flex items-center justify-center">
//                     <span className="material-symbols-outlined absolute -left-6 text-slate-600">chair_alt</span>
//                     <span className="material-symbols-outlined absolute -right-6 text-slate-600">chair_alt</span>
//                     <div className={`w-20 h-14 rounded-full border-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center text-xs font-bold italic transition-all ${selectedTable === 'B1' ? 'border-accent-gold bg-accent-gold text-background-dark' : 'border-accent-gold/50 bg-slate-800/50'}`}>
//                       B1
//                       {selectedTable === 'B1' && (
//                         <div className="absolute -top-2 -right-2 bg-accent-gold text-background-dark rounded-full size-5 flex items-center justify-center text-[10px] font-black border-2 border-background-dark">
//                           <span className="material-symbols-outlined text-[12px]">check</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Table Window 3 */}
//                 <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('W3')}>
//                   <div className="relative flex items-center justify-center">
//                     <span className="material-symbols-outlined absolute -top-4 text-slate-600">chair_alt</span>
//                     <span className="material-symbols-outlined absolute -bottom-4 text-slate-600">chair_alt</span>
//                     <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'W3' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>W3</div>
//                   </div>
//                 </div>

//                 {/* Row 2 */}
//                 <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('C1')}>
//                   <div className="relative flex items-center justify-center">
//                     <span className="material-symbols-outlined absolute -left-4 text-slate-600">chair_alt</span>
//                     <span className="material-symbols-outlined absolute -right-4 text-slate-600">chair_alt</span>
//                     <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'C1' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>C1</div>
//                   </div>
//                 </div>

//                 {/* Bar Area Overlay */}
//                 <div className="col-span-2 row-span-1 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center justify-center">
//                   <span className="material-symbols-outlined text-slate-600 mr-2">local_bar</span>
//                   <span className="text-[10px] uppercase tracking-widest text-slate-500">Artisan Bar Area</span>
//                 </div>

//                 <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('C2')}>
//                   <div className="relative flex items-center justify-center">
//                     <span className="material-symbols-outlined absolute -left-4 text-slate-600">chair_alt</span>
//                     <span className="material-symbols-outlined absolute -right-4 text-slate-600">chair_alt</span>
//                     <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'C2' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>C2</div>
//                   </div>
//                 </div>

//                 {/* Row 3 */}
//                 <div className="flex flex-col items-center gap-2 group cursor-pointer">
//                   <div className="relative flex items-center justify-center">
//                     <span className="material-symbols-outlined absolute -left-6 text-slate-600 rotate-90">chair_alt</span>
//                     <div className="w-14 h-24 rounded-lg bg-slate-800/30 border-2 border-slate-700 flex items-center justify-center text-slate-600 cursor-not-allowed">
//                       <span className="text-xs font-bold opacity-40">P1</span>
//                     </div>
//                     <span className="absolute text-[8px] bg-slate-700 px-1 rounded text-slate-300">BOOKED</span>
//                   </div>
//                 </div>

//                 <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('C3')}>
//                   <div className="relative flex items-center justify-center">
//                     <span className="material-symbols-outlined absolute -left-4 text-slate-600">chair_alt</span>
//                     <span className="material-symbols-outlined absolute -right-4 text-slate-600">chair_alt</span>
//                     <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'C3' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>C3</div>
//                   </div>
//                 </div>

//                 <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTable('C4')}>
//                   <div className="relative flex items-center justify-center">
//                     <span className="material-symbols-outlined absolute -left-4 text-slate-600">chair_alt</span>
//                     <span className="material-symbols-outlined absolute -right-4 text-slate-600">chair_alt</span>
//                     <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedTable === 'C4' ? 'border-primary bg-primary text-white' : 'border-primary/40 bg-slate-800 text-primary'}`}>C4</div>
//                   </div>
//                 </div>

//                 <div className="flex flex-col items-center gap-2 group cursor-pointer">
//                   <div className="relative flex items-center justify-center">
//                     <span className="material-symbols-outlined absolute -right-6 text-slate-600 -rotate-90">chair_alt</span>
//                     <div className="w-14 h-24 rounded-lg bg-slate-800/30 border-2 border-slate-700 flex items-center justify-center text-slate-600 cursor-not-allowed">
//                       <span className="text-xs font-bold opacity-40">P2</span>
//                     </div>
//                     <span className="absolute text-[8px] bg-slate-700 px-1 rounded text-slate-300">BOOKED</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Legend */}
//           <div className="absolute bottom-4 right-4 flex gap-4 bg-background-dark/80 backdrop-blur p-3 rounded-lg border border-primary/10">
//             <div className="flex items-center gap-2">
//               <div className="size-3 rounded-full bg-slate-800 border border-primary/40"></div>
//               <span className="text-[10px] text-slate-400">Available</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="size-3 rounded-full bg-accent-gold"></div>
//               <span className="text-[10px] text-slate-400">Selected</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="size-3 rounded-full bg-slate-700 opacity-50"></div>
//               <span className="text-[10px] text-slate-400">Occupied</span>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar Details */}
//         <aside className="w-full lg:w-96 bg-background-dark border-l border-primary/20 flex flex-col">
//           <div className="p-6 border-b border-primary/10">
//             <div className="flex items-center gap-4 mb-6">
//               <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
//                 <span className="material-symbols-outlined text-3xl">event_seat</span>
//               </div>
//               <div>
//                 <h3 className="text-lg font-bold text-slate-100">Selection Details</h3>
//                 <p className="text-xs text-slate-500">Table #{selectedTable} - {selectedTable.startsWith('B') ? 'Velvet Booth' : selectedTable.startsWith('W') ? 'Window Seat' : 'Center Table'}</p>
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-xs uppercase tracking-tighter text-slate-500">Category</span>
//                   <span className="text-xs font-bold text-accent-gold">{selectedTable.startsWith('B') ? 'Premium Booth' : 'Standard Seating'}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs uppercase tracking-tighter text-slate-500">Capacity</span>
//                   <span className="text-xs font-bold text-slate-200">{selectedTable.startsWith('B') ? '2-4 Guests' : '2-3 Guests'}</span>
//                 </div>
//               </div>
//               <div className="flex flex-col gap-2">
//                 <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
//                   <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">visibility</span>
//                   <div className="flex-1">
//                     <p className="text-sm font-medium text-slate-200">Central View</p>
//                     <p className="text-[10px] text-slate-500">Perfect view of the open kitchen</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
//                   <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">volume_off</span>
//                   <div className="flex-1">
//                     <p className="text-sm font-medium text-slate-200">Quiet Zone</p>
//                     <p className="text-[10px] text-slate-500">Tucked away for private conversation</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/20 border border-primary/30">
//                   <span className="material-symbols-outlined text-primary">verified</span>
//                   <div className="flex-1">
//                     <p className="text-sm font-medium text-slate-200">Sommelier Choice</p>
//                     <p className="text-[10px] text-primary/70">Includes complimentary tasting pour</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="flex-1 p-6 flex flex-col gap-4">
//             <div className="mt-auto space-y-4">
//               <div className="flex flex-col gap-1">
//                 <label className="text-[10px] uppercase tracking-widest text-slate-500 px-1">Special Occasion</label>
//                 <select defaultValue="Just Dining" className="bg-background-dark border border-slate-700 rounded-lg text-sm text-slate-300 focus:ring-primary focus:border-primary">
//                   <option>Anniversary</option>
//                   <option>Birthday</option>
//                   <option>Business Dinner</option>
//                   <option >Just Dining</option>
//                 </select>
//               </div>
//               <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
//                 <div className="flex justify-between items-center mb-1">
//                   <span className="text-slate-400 text-sm">Reservation Fee</span>
//                   <span className="text-slate-200 font-bold">$25.00</span>
//                 </div>
//                 <p className="text-[10px] text-slate-500 italic">Fee is deducted from your final bill</p>
//               </div>
//               <button onClick={() => navigate('/menu')} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group">
//                 Confirm Selection
//                 <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
//               </button>
//               <button onClick={() => navigate(-1)} className="w-full bg-transparent text-slate-400 py-3 rounded-xl font-medium text-xs hover:text-slate-100 transition-colors">
//                 Go Back
//               </button>
//             </div>
//           </div>
//         </aside>
//       </main>
//     </div>
//   )
// }
