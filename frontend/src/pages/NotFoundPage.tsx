import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-bold text-puna-500 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Página no encontrada</h1>
      <p className="text-gray-500 mb-8">La página que buscas no existe o fue movida.</p>
      <Link
        to="/"
        className="bg-puna-600 text-white px-6 py-3 rounded-lg hover:bg-puna-700 transition-colors font-medium"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
