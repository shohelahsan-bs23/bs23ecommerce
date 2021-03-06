using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        private readonly StoreContext _context;
        public GenericRepository(StoreContext context)
        {
            _context = context;
        }

        public async Task<T> GetByIdAsync(int id)
        {
            var item = await _context.Set<T>().FindAsync(id);
            return item;
        }

        public async Task<IReadOnlyList<T>> ListAllAsync()
        {
            var itemList = await _context.Set<T>().ToListAsync();
            return itemList;
        }

        public async Task<T> GetEntityWithSpec(ISpecification<T> spec)
        {
            return await ApplySpecification(spec).FirstOrDefaultAsync();
        }
        
        public async Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec)
        {
            return await ApplySpecification(spec).ToListAsync();
        }

        public async Task<int> CountAsync(ISpecification<T> spec)
        {
            return await ApplySpecification(spec).CountAsync();
        }
        
        public async Task<int> CountAsync()
        {
            return await _context.Set<T>().AsQueryable().CountAsync();
        }

        private IQueryable<T> ApplySpecification(ISpecification<T> spec)
        {
            return SpecificationEvaluator<T>.GetQuery(_context.Set<T>().AsQueryable(),spec);
        }

        public void Add(T entity)
        {
            _context.Set<T>().Add(entity);
        }

        public void AddRange(IEnumerable<T> entityList)
        {
            _context.Set<T>().AddRange(entityList);
        }

        public void Update(T entity)
        {
            _context.Set<T>().Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public void UpdateRange(IEnumerable<T> entityList)
        {
            _context.Set<T>().AttachRange(entityList);
            foreach (var entity in entityList)
            {
                _context.Entry(entity).State = EntityState.Modified;
            }            
        }

        public void Delete(T entity)
        {
            _context.Set<T>().Remove(entity);
        }
    }
}