import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';

import './App.css';
import HomePage from './pages/Home';


const router = createBrowserRouter([
  {
    path: '/',
    // errorElement:<ErrorPage />,
    id:'root',
    children:[
        { index: true,
          element: <HomePage/>,
        },
    ]
  },
])


const App=()=> {
  return <PrimeReactProvider> <RouterProvider router={router} /> </PrimeReactProvider>;
}

export default App;