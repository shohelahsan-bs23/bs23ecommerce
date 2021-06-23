using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Specifications
{
    public class OrderParams
    {
        public OrderSpecParams OrderSpecParams { get; set; }
        public int[] OrderIds { get; set; }
    }
}
