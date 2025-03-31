import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    
    // Always show page 1
    pageNumbers.push(1);
    
    // Calculate range of pages to show around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after page 1 if needed
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <nav className="flex items-center justify-center mt-8" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        className="rounded-l-md"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span className="sr-only">Previous Page</span>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      {getPageNumbers().map((page, index) => {
        if (typeof page === 'string') {
          return (
            <span 
              key={`ellipsis-${index}`} 
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              {page}
            </span>
          );
        }
        
        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            className={`border ${currentPage === page ? "bg-primary text-white" : "bg-white text-gray-700"}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="icon"
        className="rounded-r-md"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="sr-only">Next Page</span>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </nav>
  );
}
