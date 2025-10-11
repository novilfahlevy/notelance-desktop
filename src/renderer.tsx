import { createRoot, type Root } from 'react-dom/client'
import App from '@/App'
import { Provider } from 'react-redux'
import { store } from '@/app/store'

const root: Root = createRoot(document.getElementById('app'))
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)