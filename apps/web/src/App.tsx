import { RouterProvider } from "react-router";
import { Provider } from "./components/provider/provider";
import { router } from "./router";
export default function App() {
  return (
    <Provider>
      <RouterProvider router={router} />
    </Provider>
  );
}
