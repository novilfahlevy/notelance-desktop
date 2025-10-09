import { createRoot, type Root } from 'react-dom/client'
import App from './App'

const root: Root = createRoot(document.getElementById('app'))
root.render(<App />)