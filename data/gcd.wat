;; // ユークリッドの互除法(a,bの最大公約数を求める)
;; i32 gcd(i32 a, i32 b) {
;;   i32 tmp;
;; 
;;   // 必ず a >= b にする
;;   if (a < b) {
;;     tmp = a;
;;     a = b;
;;     b = tmp;
;;   }
;; 
;;   while (true) {
;;     if (b == 0) {
;;       return a;
;;     }
;;     tmp = a % b;
;;     a = b;
;;     b = tmp;
;;   }
;; }
(module
  (func (export "gcd") (param $small i32) (param $large i32) (result i32)
    (local $rem i32)
    (local $tmp i32)
  
    ;; $large must be larger than $small
    (if (i32.lt_s (local.get $large) (local.get $small))
      (then
        ;; swap
        (local.set $tmp (local.get $large))
        (local.set $large (local.get $small))
        (local.set $small (local.get $tmp))
      )
    )

    ;; gcd
    (block $block
      (loop $loop
        (local.set $rem (i32.rem_s (local.get $large) (local.get $small)))
        (local.get $rem)
        (br_if $block (i32.eqz))

        (local.set $tmp (local.get $large))
        (local.set $large (local.get $small))
        (local.set $small (local.get $rem))
        (br $loop)
      )
    )

    (local.get $small)
  )
)
