import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

export default function Charts({ data }) {
  const sentiments = Object.entries(data.sentiments || {}).map(([name, value]) => ({ name, value }));
  const emotions = Object.entries(data.emotions || {}).map(([name, value]) => ({ name, value }));
  const terms = data.termFrequency || [];

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-bold mb-2">Distribución de Sentimientos</h3>
        <PieChart width={300} height={300}>
          <Pie data={sentiments} dataKey="value" nameKey="name" outerRadius={100}>
            {sentiments.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-bold mb-2">Distribución de Emociones</h3>
        <PieChart width={300} height={300}>
          <Pie data={emotions} dataKey="value" nameKey="name" outerRadius={100}>
            {emotions.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div className="bg-white p-4 shadow rounded md:col-span-2">
        <h3 className="font-bold mb-2">Términos más frecuentes</h3>
        <BarChart width={600} height={300} data={terms}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="term" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
}
