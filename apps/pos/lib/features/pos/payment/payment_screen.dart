import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/repository.dart';
import '../cart/cart_bloc.dart';
import '../cart/cart_event.dart';

class PaymentScreen extends StatefulWidget {
  final double total;
  final TransactionRepository transactionRepository;
  final String activeSessionId;

  const PaymentScreen({
    super.key,
    required this.total,
    required this.transactionRepository,
    required this.activeSessionId,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _amountInput = '';

  double get _paidAmount => double.tryParse(_amountInput) ?? 0.0;
  double get _change => _paidAmount - widget.total;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isExactPay = _paidAmount == widget.total;
    final isSufficient = _paidAmount >= widget.total;

    final shortcuts = [
      widget.total, // Uang Pas
      5000.0,
      10000.0,
      20000.0,
      50000.0,
      100000.0,
    ];

    // Filter shortcuts to make sense (only show standard bills or bills greater than total)
    final filteredShortcuts = shortcuts.toSet().where((amt) => amt >= widget.total || amt == 50000.0 || amt == 100000.0).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Pembayaran Tunai',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Content Area
          Expanded(
            child: Row(
              children: [
                // Info & Input Display Side
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('TOTAL TAGIHAN', style: TextStyle(color: Colors.grey, fontSize: 14)),
                        const SizedBox(height: 4),
                        Text(
                          'Rp ${_formatPrice(widget.total)}',
                          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: theme.colorScheme.primary),
                        ),
                        const SizedBox(height: 24),
                        const Text('JUMLAH BAYAR', style: TextStyle(color: Colors.grey, fontSize: 14)),
                        const SizedBox(height: 4),
                        Text(
                          _amountInput.isEmpty ? 'Rp 0' : 'Rp ${_formatPrice(_paidAmount)}',
                          style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 24),
                        const Text('KEMBALIAN', style: TextStyle(color: Colors.grey, fontSize: 14)),
                        const SizedBox(height: 4),
                        Text(
                          isSufficient ? 'Rp ${_formatPrice(_change)}' : 'Uang Kurang',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: isSufficient ? Colors.green : Colors.red,
                          ),
                        ),
                        const Spacer(),
                        // Fast Cash Shortcuts
                        const Text('Uang Cepat', style: TextStyle(color: Colors.grey, fontSize: 12)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: filteredShortcuts.map((amt) {
                            final isPas = amt == widget.total;
                            return InkWell(
                              onTap: () {
                                setState(() {
                                  _amountInput = amt.toStringAsFixed(0);
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey[350]!),
                                  borderRadius: BorderRadius.circular(8),
                                  color: isPas ? theme.colorScheme.primaryContainer : Colors.white,
                                ),
                                child: Text(
                                  isPas ? 'Uang Pas' : 'Rp ${_formatPrice(amt)}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isPas ? theme.colorScheme.primary : Colors.black,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                ),
                // Numpad & Submit Button Side
                Container(
                  width: 380,
                  color: Colors.grey[50],
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      // Grid Numpad
                      Expanded(
                        child: GridView.builder(
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            childAspectRatio: 1.3,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: 12,
                          itemBuilder: (context, index) {
                            if (index == 9) {
                              // Clear Button
                              return _buildNumpadButton('C', () {
                                setState(() {
                                  _amountInput = '';
                                });
                              });
                            }
                            if (index == 10) {
                              // Zero Button
                              return _buildNumpadButton('0', () => _onNumpadPress('0'));
                            }
                            if (index == 11) {
                              // Backspace Button
                              return _buildNumpadButton(
                                '⌫',
                                () {
                                  if (_amountInput.isNotEmpty) {
                                    setState(() {
                                      _amountInput = _amountInput.substring(0, _amountInput.length - 1);
                                    });
                                  }
                                },
                                isAction: true,
                              );
                            }
                            // 1-9 Buttons
                            final num = (index + 1).toString();
                            return _buildNumpadButton(num, () => _onNumpadPress(num));
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Submit Checkout Button
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isSufficient ? Colors.green : Colors.grey[400],
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: isSufficient
                              ? () => _processCheckout(context)
                              : null,
                          child: const Text(
                            'PROSES PEMBAYARAN',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _onNumpadPress(String val) {
    if (_amountInput.length >= 10) return; // Limit digits
    setState(() {
      _amountInput += val;
    });
  }

  Widget _buildNumpadButton(String text, VoidCallback onPressed, {bool isAction = false}) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: isAction ? Colors.orange[50] : Colors.white,
        foregroundColor: isAction ? Colors.orange[800] : Colors.black87,
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      onPressed: onPressed,
      child: Text(
        text,
        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
      ),
    );
  }

  void _processCheckout(BuildContext context) {
    // Dispatch checkout event to CartBloc
    context.read<CartBloc>().add(CheckoutCashEvent(
          repository: widget.transactionRepository,
          sessionId: widget.activeSessionId,
          cashPaid: _paidAmount,
        ));

    // Pop the payment modal sheet
    Navigator.pop(context);

    // Show Success Dialog with Change Info
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (successContext) => AlertDialog(
        title: const Center(
          child: Column(
            children: [
              Icon(Icons.check_circle_outline, size: 64, color: Colors.green),
              SizedBox(height: 8),
              Text(
                'Transaksi Berhasil!',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Divider(),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total Tagihan:'),
                Text('Rp ${_formatPrice(widget.total)}', style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Uang Dibayar:'),
                Text('Rp ${_formatPrice(_paidAmount)}', style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Kembalian:', style: TextStyle(color: Colors.green[800], fontWeight: FontWeight.bold)),
                  Text(
                    'Rp ${_formatPrice(_change)}',
                    style: TextStyle(color: Colors.green[800], fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(successContext);
            },
            child: const Text('SELESAI'),
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
