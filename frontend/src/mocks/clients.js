export const clients = Array.from({ length: 15 }, (_, i) => {
  const firstNames = ['Alex', 'Elena', 'James', 'Sophie', 'Michael', 'Sarah', 'David', 'Emma', 'Daniel', 'Olivia', 'Lucas', 'Mia', 'William', 'Isabella', 'Mateo'];
  const lastNames = ['Mercer', 'Rostova', 'Wilson', 'Turner', 'Chen', 'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Rodriguez', 'Lopez', 'Gonzalez'];
  const locations = ['New York, NY', 'London, UK', 'Chicago, IL', 'Miami, FL', 'San Francisco, CA', 'Toronto, CA', 'Sydney, AU', 'Berlin, DE', 'Paris, FR', 'Tokyo, JP'];
  
  const id = i + 1;
  const isVip = i % 3 === 0;
  const isActive = i % 5 !== 0; // Algún inactivo
  const accountStatus = !isActive ? 'Inactive' : isVip ? 'VIP' : 'Active';
  
  return {
    id,
    clientId: `SPZ-${1000 + i * 142}-X`,
    nombre: firstNames[i],
    apellido: lastNames[i],
    email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`,
    telefono: `+1 (555) 019-${2000 + i}`,
    ubicacion: locations[i % locations.length],
    riskProfile: i % 2 === 0 ? 'Aggressive' : i % 3 === 0 ? 'Conservative' : 'Balanced',
    accountStatus,
    totalCapitalInvested: 100000 + Math.random() * 2000000,
    dineroTotal: 100000 + Math.random() * 2000000,
    beneficioTotal: Math.random() * 500000,
    inversionInicial: 50000 + Math.random() * 500000,
    dineroChange: Number(((Math.random() * 15) - 5).toFixed(1)),
    beneficioChange: Number(((Math.random() * 25) - 5).toFixed(1)),
    ytdChange: (Math.random() * 30) - 10,
    portfolioDistribution: [
      { name: 'BTC', value: 45, color: '#F7931A' },
      { name: 'ETH', value: 30, color: '#627EEA' },
      { name: 'SOL', value: 25, color: '#14F195' },
    ],
    capitalSetup: 50000 + Math.random() * 500000,
    fechaRegistro: new Date(2022 + (i % 3), i % 12, (i * 2) % 28 + 1).toISOString(),
    ultimaConexion: new Date().toISOString(),
    activo: isActive,
    segmentos: isVip ? ['Premium', 'Active Trader'] : ['Standard'],
    interactionHistory: [
      { id: 1, date: new Date().toLocaleDateString('es-ES'), title: 'Compra', description: 'Compra de 0.5 BTC' },
      { id: 2, date: new Date(Date.now() - 86400000).toLocaleDateString('es-ES'), title: 'Depósito', description: 'Ingreso de 10,000 USD' },
      { id: 3, date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('es-ES'), title: 'Venta', description: 'Venta de 10 SOL' }
    ],
    capitalHistory: Array.from({ length: 7 }, (_, j) => ({
      month: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][j],
      value: 100 + j * 10 + Math.random() * 50
    })),
  }
})
