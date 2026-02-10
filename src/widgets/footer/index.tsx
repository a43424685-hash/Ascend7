export function Footer() {
  return (
    <footer className="border-t border-black mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-sm font-semibold mb-2">ASCEND7</p>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} ASCEND7. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

