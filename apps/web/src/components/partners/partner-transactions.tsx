'use client';

import React from 'react';
import Link from 'next/link';
import { usePurchaseOrders } from '@web/hooks/use-purchase-orders';
import { useSalesOrders } from '@web/hooks/use-sales-orders';
import { useGoodsReceipts } from '@web/hooks/use-goods-receipts';
import { useDeliveryNotes } from '@web/hooks/use-delivery-notes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@web/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@web/components/ui/table';
import { Badge } from '@web/components/ui/badge';
import { FileTextIcon, ArrowRightIcon } from 'lucide-react';
import { Skeleton } from '@web/components/ui/skeleton';

interface PartnerTransactionsProps {
  partnerId: string;
  partnerType: 'SUPPLIER' | 'CUSTOMER';
  partnerName: string;
}

export function PartnerTransactions({ partnerId, partnerType, partnerName }: PartnerTransactionsProps) {
  const isSupplier = partnerType === 'SUPPLIER';

  // Fetch POs if supplier
  const { data: posData, isLoading: isLoadingPos } = usePurchaseOrders(
    isSupplier ? { supplierId: partnerId, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' } : {}
  );

  // Fetch GRNs if supplier
  const { data: grnsData, isLoading: isLoadingGrns } = useGoodsReceipts(
    isSupplier ? { supplierId: partnerId, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' } : {}
  );

  // Fetch SOs if customer
  const { data: sosData, isLoading: isLoadingSos } = useSalesOrders(
    !isSupplier ? { customerId: partnerId, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' } : {}
  );

  // Fetch DNs if customer
  const { data: dnsData, isLoading: isLoadingDns } = useDeliveryNotes(
    !isSupplier ? { customerId: partnerId, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' } : {}
  );

  const renderPOList = () => {
    if (isLoadingPos) {
      return (
        <div className="space-y-2 py-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    const pos = posData?.data || [];

    if (pos.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-muted-foreground italic border rounded-lg border-dashed">
          No purchase orders found for this supplier.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pos.map((po) => (
                <TableRow key={po.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium font-mono">
                    <Link href={`/purchasing/purchase-orders/${po.id}`} className="hover:underline text-primary">
                      {po.number}
                    </Link>
                  </TableCell>
                  <TableCell>{new Date(po.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={po.status === 'APPROVED' ? 'default' : po.status === 'DRAFT' ? 'outline' : 'secondary'}>
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(po.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <Link
            href={`/purchasing/purchase-orders?search=${encodeURIComponent(partnerName)}`}
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View all Purchase Orders
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  };

  const renderGRNList = () => {
    if (isLoadingGrns) {
      return (
        <div className="space-y-2 py-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    const grns = grnsData?.data || [];

    if (grns.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-muted-foreground italic border rounded-lg border-dashed">
          No goods receipts found for this supplier.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Warehouse</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grns.map((grn) => (
                <TableRow key={grn.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium font-mono">
                    <Link href={`/purchasing/goods-receipts/${grn.id}`} className="hover:underline text-primary">
                      {grn.number}
                    </Link>
                  </TableCell>
                  <TableCell>{new Date(grn.receivedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={grn.status === 'CONFIRMED' ? 'default' : 'outline'}>
                      {grn.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{grn.warehouse?.name || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <Link
            href={`/purchasing/goods-receipts?search=${encodeURIComponent(partnerName)}`}
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View all Goods Receipts
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  };

  const renderSOList = () => {
    if (isLoadingSos) {
      return (
        <div className="space-y-2 py-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    const sos = sosData?.data || [];

    if (sos.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-muted-foreground italic border rounded-lg border-dashed">
          No sales orders found for this customer.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sos.map((so) => (
                <TableRow key={so.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium font-mono">
                    <Link href={`/sales/sales-orders/${so.id}`} className="hover:underline text-primary">
                      {so.number}
                    </Link>
                  </TableCell>
                  <TableCell>{new Date(so.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={so.status === 'CONFIRMED' || so.status === 'DONE' ? 'default' : so.status === 'DRAFT' ? 'outline' : 'secondary'}>
                      {so.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(so.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <Link
            href={`/sales/sales-orders?search=${encodeURIComponent(partnerName)}`}
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View all Sales Orders
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  };

  const renderDNList = () => {
    if (isLoadingDns) {
      return (
        <div className="space-y-2 py-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    const dns = dnsData?.data || [];

    if (dns.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-muted-foreground italic border rounded-lg border-dashed">
          No delivery notes found for this customer.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dns.map((dn) => (
                <TableRow key={dn.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium font-mono">
                    <Link href={`/sales/delivery-notes/${dn.id}`} className="hover:underline text-primary">
                      {dn.number}
                    </Link>
                  </TableCell>
                  <TableCell>{new Date(dn.deliveryDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={dn.status === 'CONFIRMED' ? 'default' : 'outline'}>
                      {dn.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <Link
            href={`/sales/delivery-notes?search=${encodeURIComponent(partnerName)}`}
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View all Delivery Notes
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileTextIcon className="w-4 h-4 text-muted-foreground" />
          Related Transactions
        </CardTitle>
        <CardDescription>
          Historical records, invoices, stock movements, and orders linked to this partner.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Tabs defaultValue={isSupplier ? 'pos' : 'sos'} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            {isSupplier ? (
              <>
                <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
                <TabsTrigger value="grns">Goods Receipts</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="sos">Sales Orders</TabsTrigger>
                <TabsTrigger value="dns">Delivery Notes</TabsTrigger>
              </>
            )}
          </TabsList>
          
          {isSupplier ? (
            <>
              <TabsContent value="pos" className="mt-0">
                {renderPOList()}
              </TabsContent>
              <TabsContent value="grns" className="mt-0">
                {renderGRNList()}
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="sos" className="mt-0">
                {renderSOList()}
              </TabsContent>
              <TabsContent value="dns" className="mt-0">
                {renderDNList()}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
