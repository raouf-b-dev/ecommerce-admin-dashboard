import { createBrowserRouter } from 'react-router';
import { App } from './App';

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-3xl font-semibold">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </section>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <PlaceholderPage
            title="Dashboard"
            description="Summary widgets, alerts, and operational snapshots will land here after the foundation and data contracts are in place."
          />
        ),
      },
      {
        path: 'products',
        element: (
          <PlaceholderPage
            title="Products"
            description="Product list, filters, and editor flows will follow the product feature phase."
          />
        ),
      },
      {
        path: 'orders',
        element: (
          <PlaceholderPage
            title="Orders"
            description="Order list, detail, and status actions will be wired once the admin operations phase begins."
          />
        ),
      },
      {
        path: 'login',
        element: (
          <PlaceholderPage
            title="Login"
            description="Authentication UI is intentionally deferred. This placeholder keeps the route shell in place for the next phase."
          />
        ),
      },
      {
        path: '*',
        element: (
          <PlaceholderPage
            title="Not Found"
            description="The requested page does not exist."
          />
        ),
      },
    ],
  },
]);
