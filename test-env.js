require('dotenv').config()

console.log('=== Environment Variable Debug ===')
console.log('Current working directory:', process.cwd())
console.log('All environment variables containing "GITHUB":', Object.keys(process.env).filter(key => key.includes('GITHUB')))
console.log('GITHUB_TOKEN value:', process.env.GITHUB_TOKEN ? 'EXISTS' : 'NOT FOUND')
console.log('GITHUB_TOKEN length:', process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.length : 0)
console.log('GITHUB_TOKEN first 4 chars:', process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.substring(0, 4) : 'N/A')
console.log('All env vars starting with GITHUB:')
Object.keys(process.env).filter(key => key.startsWith('GITHUB')).forEach(key => {
  console.log(`  ${key}: ${process.env[key] ? 'EXISTS' : 'NOT FOUND'}`)
})
console.log('=== End Debug ===') 