export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Nexora Career Guidance
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#666', textAlign: 'center', maxWidth: '600px' }}>
        Welcome to your comprehensive career guidance application. 
        Get started by exploring career paths and opportunities.
      </p>
    </main>
  )
}
