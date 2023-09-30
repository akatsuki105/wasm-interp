(module
  ;; 整数を一つ引数 として受け取り、その値が 10 以上なら 1 を返し、そうでなければ 0 を返す関数
  (func (export "ge10") (param $param i32) (result i32)
    (if (result i32) (i32.ge_s (local.get $param) (i32.const 10))
      (then (i32.const 1))
      (else (i32.const 0))
    )
  )
)