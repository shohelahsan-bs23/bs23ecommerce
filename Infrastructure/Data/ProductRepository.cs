using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities;
using Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class ProductRepository : IProductRepository
    {
        private readonly StoreContext _context;
        public ProductRepository(StoreContext context)
        {
            _context = context;
        }

        public async Task<ProductBrand> GetProductBrandByIdAsync(int id)
        {
            var productBrand = await _context.ProductBrands.FindAsync(id);
            return productBrand;
        }

        public async Task<IReadOnlyList<ProductBrand>> GetProductBrandsAsync()
        {
            var productBrands = await _context.ProductBrands.ToListAsync();
            return productBrands;
        }

        public async Task<Product> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
            .Include(p=>p.ProductBrand)
            .Include(p=>p.ProductType)
            .FirstOrDefaultAsync(p=>p.Id==id);
            return product;
        }

        public async Task<IReadOnlyList<Product>> GetProductsAsync()
        {
            var products = await _context.Products
            .Include(p=>p.ProductBrand)
            .Include(p=>p.ProductType)
            .ToListAsync();
            return products;
        }

        public async Task<ProductType> GetProductTypeByIdAsync(int id)
        {
            var productType = await _context.ProductTypes.FindAsync(id);
            return productType;
        }

        public async Task<IReadOnlyList<ProductType>> GetProductTypesAsync()
        {
            var productTypes = await _context.ProductTypes.ToListAsync();
            return productTypes;
        }
    }
}