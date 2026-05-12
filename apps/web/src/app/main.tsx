import { createRoot } from 'react-dom/client'
import '../common/styles/index.css';
import { GlobalProvider } from './providers/GlobalProvider';

createRoot(document.getElementById('root')!).render(<GlobalProvider />
)
