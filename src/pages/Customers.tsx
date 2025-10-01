import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Customers = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Customer management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;