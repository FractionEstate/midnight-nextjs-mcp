#!/usr/bin/env node
import { cmdSync } from '../dist/config/docs-cli.js';

;(async () => {
  try {
    console.log('Starting docs sync...')
    const res = await cmdSync({ force: true, verbose: true })
    if (!res.success) {
      console.error('Docs sync reported failure:', res.message)
      process.exit(1)
    }
    console.log('Docs sync completed:', res.message)
    process.exit(0)
  } catch (err) {
    console.error('Docs sync failed:', err)
    process.exit(1)
  }
})()
