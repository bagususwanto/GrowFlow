import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/repository.dart';
import '../payment/payment_screen.dart';
import 'cart_bloc.dart';
import 'cart_event.dart';
import 'cart_state.dart';

class CartWidget extends StatelessWidget {
  final TransactionRepository transactionRepository;
  final String activeSessionId;

  const CartWidget({
    super.key,
    required this.transactionRepository,
    required this.activeSessionId,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: 400,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          left: BorderSide(color: Colors.grey[300]!, width: 1),
        ),
      ),
      child: BlocBuilder<CartBloc, CartState>(
        builder: (context, state) {
          if (state.items.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(
                    'Keranjang Belanja Kosong',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Cart Header
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Keranjang',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    TextButton.icon(
                      onPressed: () {
                        context.read<CartBloc>().add(ClearCartEvent());
                      },
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      label: const Text('Clear', style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              // Cart Items List
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: state.items.length,
                  separatorBuilder: (context, index) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final item = state.items[index];
                    return _CartItemRow(item: item);
                  },
                ),
              ),
              const Divider(height: 1),
              // Calculations Area
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildCalcRow('Subtotal', state.subtotal),
                    const SizedBox(height: 8),
                    _buildDiscountRow(context, 'Diskon Global', state.globalDiscount),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'TOTAL',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Rp ${_formatPrice(state.total)}',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Action Buttons
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () {
                          context.read<CartBloc>().add(HoldCurrentCartEvent(
                                repository: transactionRepository,
                                sessionId: activeSessionId,
                              ));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Transaksi disimpan (Hold)')),
                          );
                        },
                        icon: const Icon(Icons.pause),
                        label: const Text('HOLD'),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () {
                          // Buka modal Numpad Pembayaran Tunai (Cash)
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (modalContext) {
                              return BlocProvider.value(
                                value: context.read<CartBloc>(),
                                child: PaymentScreen(
                                  total: state.total,
                                  transactionRepository: transactionRepository,
                                  activeSessionId: activeSessionId,
                                ),
                              );
                            },
                          );
                        },
                        child: const Text(
                          'BAYAR',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCalcRow(String label, double amount) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.grey[600])),
        Text('Rp ${_formatPrice(amount)}', style: const TextStyle(fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildDiscountRow(BuildContext context, String label, double amount) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.grey[600])),
        Row(
          children: [
            Text('- Rp ${_formatPrice(amount)}', style: const TextStyle(color: Colors.red)),
            const SizedBox(width: 4),
            IconButton(
              icon: const Icon(Icons.edit, size: 16, color: Colors.blue),
              onPressed: () => _showDiscountDialog(context),
            ),
          ],
        ),
      ],
    );
  }

  void _showDiscountDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (diagContext) => AlertDialog(
        title: const Text('Set Diskon Global'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Nominal Diskon (Rp)',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(diagContext),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              final discount = double.tryParse(controller.text) ?? 0.0;
              context.read<CartBloc>().add(SetGlobalDiscountEvent(discount));
              Navigator.pop(diagContext);
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]}.',
        );
  }
}

class _CartItemRow extends StatelessWidget {
  final CartItem item;

  const _CartItemRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Item Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product.name,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Text(
                  'Rp ${_formatPrice(item.unitPrice)}',
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
              ],
            ),
          ),
          // Quantity Adjuster
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline, size: 24, color: Colors.blue),
                onPressed: () {
                  context.read<CartBloc>().add(UpdateQtyEvent(item.product, item.quantity - 1));
                },
              ),
              Container(
                width: 32,
                alignment: Alignment.center,
                child: Text(
                  '${item.quantity}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, size: 24, color: Colors.blue),
                onPressed: () {
                  context.read<CartBloc>().add(UpdateQtyEvent(item.product, item.quantity + 1));
                },
              ),
            ],
          ),
          const SizedBox(width: 8),
          // Total Price
          Container(
            width: 90,
            alignment: Alignment.centerRight,
            child: Text(
              'Rp ${_formatPrice(item.totalPrice)}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]}.',
        );
  }
}
