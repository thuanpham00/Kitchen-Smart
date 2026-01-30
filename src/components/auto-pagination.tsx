import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { AccountQueryType } from "@/schemaValidations/account.schema";
import { ChevronLeft, ChevronRight } from "lucide-react";
interface Props {
  page: number;
  totalPages: number;
  pathname?: string;
  isLink?: boolean;
  onClick?: (pageNumber: number) => void;
  queryConfig?: AccountQueryType;
}

/**
Với range = 2 áp dụng cho khoảng cách đầu, cuối và xung quanh current_page

[1] 2 3 ... 19 20
1 [2] 3 4 ... 19 20 
1 2 [3] 4 5 ... 19 20
1 2 3 [4] 5 6 ... 19 20
1 2 3 4 [5] 6 7 ... 19 20

1 2 ... 4 5 [6] 8 9 ... 19 20

1 2 ...13 14 [15] 16 17 ... 19 20


1 2 ... 14 15 [16] 17 18 19 20
1 2 ... 15 16 [17] 18 19 20
1 2 ... 16 17 [18] 19 20
1 2 ... 17 18 [19] 20
1 2 ... 18 19 [20]
 */

const RANGE = 2;
export default function AutoPagination({
  page,
  totalPages,
  pathname = "/",
  isLink = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClick = (pageNumber) => {},
  queryConfig,
}: Props) {
  const renderPagination = () => {
    let dotAfter = false;
    let dotBefore = false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const renderDotBefore = (index: number) => {
      if (!dotBefore) {
        dotBefore = true;
        return (
          <PaginationItem key={`dot-before-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      return null;
    };
    const renderDotAfter = (index: number) => {
      if (!dotAfter) {
        dotAfter = true;
        return (
          <PaginationItem key={`dot-after-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      return null;
    };
    return Array(totalPages)
      .fill(0)
      .map((_, index) => {
        const pageNumber = index + 1;

        // Điều kiện để return về ...
        if (page <= RANGE * 2 + 1 && pageNumber > page + RANGE && pageNumber < totalPages - RANGE + 1) {
          return renderDotAfter(index);
        } else if (page > RANGE * 2 + 1 && page < totalPages - RANGE * 2) {
          if (pageNumber < page - RANGE && pageNumber > RANGE) {
            return renderDotBefore(index);
          } else if (pageNumber > page + RANGE && pageNumber < totalPages - RANGE + 1) {
            return renderDotAfter(index);
          }
        } else if (page >= totalPages - RANGE * 2 && pageNumber > RANGE && pageNumber < page - RANGE) {
          return renderDotBefore(index);
        }
        return (
          <PaginationItem key={`page-${pageNumber}`}>
            {isLink ? (
              <PaginationLink
                href={{
                  pathname,
                  query: {
                    ...queryConfig,
                    page: pageNumber,
                  },
                }}
                isActive={pageNumber === page}
              >
                {pageNumber}
              </PaginationLink>
            ) : (
              <Button
                onClick={() => {
                  onClick(pageNumber);
                }}
                variant={pageNumber === page ? "outline" : "ghost"}
                className={cn("h-8 w-8 p-0")}
              >
                {pageNumber}
              </Button>
            )}
          </PaginationItem>
        );
      });
  };
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {isLink ? (
            <PaginationPrevious
              href={{
                pathname,
                query: {
                  ...queryConfig,
                  page: page - 1,
                },
              }}
              className={cn({
                "cursor-not-allowed": page === 1,
              })}
              onClick={(e) => {
                if (page === 1) {
                  e.preventDefault();
                }
              }}
            />
          ) : (
            <Button
              className={cn("w-8 h-8 p-0")}
              onClick={(e) => {
                onClick(page - 1);
                if (page === 1) {
                  e.preventDefault();
                }
              }}
              variant={"ghost"}
              disabled={page === 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
        </PaginationItem>
        {renderPagination()}

        <PaginationItem>
          {isLink ? (
            <PaginationNext
              href={{
                pathname,
                query: {
                  ...queryConfig,
                  page: page + 1,
                },
              }}
              className={cn({
                "cursor-not-allowed": page === totalPages,
              })}
              onClick={(e) => {
                if (page === totalPages) {
                  e.preventDefault();
                }
              }}
            />
          ) : (
            <Button
              className={cn("w-8 h-8 p-0")}
              onClick={(e) => {
                onClick(page + 1);
                if (page === totalPages) {
                  e.preventDefault();
                }
              }}
              variant={"ghost"}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
