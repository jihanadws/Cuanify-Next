// Database error handler utility
export const logDatabaseSetupInstructions = () => {
  console.group('🔧 DATABASE SETUP REQUIRED');
  console.log('');
  console.log('📋 The database tables are not created yet. Follow these steps:');
  console.log('');
  console.log('1️⃣ Go to your Supabase Dashboard (https://supabase.com)');
  console.log('2️⃣ Navigate to SQL Editor');
  console.log('3️⃣ Copy the entire content from: sql/complete_setup.sql');
  console.log('4️⃣ Paste and RUN the SQL script');
  console.log('');
  console.log('📄 Tables that will be created:');
  console.log('   • profiles - User profile information');
  console.log('   • transactions - Financial transactions');
  console.log('   • accounts - User accounts (bank, wallet, etc.)');
  console.log('   • budgets - Budget management');
  console.log('');
  console.log('🔒 Security features included:');
  console.log('   • Row Level Security (RLS)');
  console.log('   • User-specific data access policies');
  console.log('   • Automatic triggers for timestamps');
  console.log('');
  console.log('📁 SQL File Location: sql/complete_setup.sql');
  console.log('');
  console.groupEnd();
}

export const handleDatabaseError = (error: unknown, operation: string) => {
  // Handle case where error might be null, undefined, or not a proper error object
  if (!error) {
    console.error(`Error ${operation}: No error object provided`)
    return `Failed to ${operation}: Unknown error`
  }

  // Log the full error object first
  console.error(`Error ${operation} - Full error:`, error)
  
  // Enhanced error inspection for objects that appear empty
  console.error(`Error ${operation} - Error type:`, typeof error)
  console.error(`Error ${operation} - Error constructor:`, (error as Record<string, unknown>).constructor?.name)
  
  // Safe toString
  try {
    if (error instanceof Error) {
      console.error(`Error ${operation} - Error toString:`, error.toString())
    } else {
      console.error(`Error ${operation} - Error toString:`, JSON.stringify(error))
    }
  } catch {
    console.error(`Error ${operation} - Error toString: <unable to stringify>`)
  }
  
  // Check for all possible properties including non-enumerable ones
  if (typeof error === 'object' && error !== null) {
    const allProps = Object.getOwnPropertyNames(error)
    console.error(`Error ${operation} - All properties:`, allProps)
    
    // Log each property value
    allProps.forEach(prop => {
      try {
        console.error(`Error ${operation} - ${prop}:`, (error as Record<string, unknown>)[prop])
      } catch {
        console.error(`Error ${operation} - ${prop}: <inaccessible>`)
      }
    })
  }
  
  // Try to extract meaningful information with type guards
  const errorObj = error as Record<string, unknown>
  const errorInfo = {
    message: (typeof errorObj.message === 'string' ? errorObj.message : 'Unknown error'),
    details: (typeof errorObj.details === 'string' ? errorObj.details : 'No details available'),
    hint: (typeof errorObj.hint === 'string' ? errorObj.hint : 'No hint available'),
    code: (typeof errorObj.code === 'string' ? errorObj.code : 'No error code')
  }
  
  console.error(`Error ${operation} - Parsed:`, errorInfo)
  
  // Check if it's a table doesn't exist error
  if (errorObj.code === '42P01' || 
      (typeof errorObj.message === 'string' && errorObj.message.includes('relation')) || 
      (typeof errorObj.message === 'string' && errorObj.message.includes('does not exist')) ||
      (typeof errorObj.message === 'string' && errorObj.message.includes('table'))) {
    console.error('🚨 Database table missing detected!')
    logDatabaseSetupInstructions()
  }
  
  return `Failed to ${operation}: ${errorInfo.message}`
}