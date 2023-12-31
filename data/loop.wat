;; int loop(void) {
;;   int sum = 0;
;;   int i = 0;
;;   {
;;     $loop:
;;       if (i >= 3) {
;;         goto $block;
;;       }
;;       i++;
;;       sum += 100;
;;       goto $loop;
;;   }
;; $block:
;;   return sum;
;; }
(module
  (func (export "loop") (result i32)
    (local $i i32)
    (local $sum i32)

    (local.set $sum (i32.const 0))
    (local.set $i (i32.const 0))
    (block $block 
      (loop $loop
        (br_if $block (i32.ge_u (local.get $i) (i32.const 3)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (local.set $sum (i32.add (local.get $sum) (i32.const 100)))
        (br $loop)
      )
    )
    (local.get $sum)
  )
)