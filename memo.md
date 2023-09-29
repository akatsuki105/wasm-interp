# メモ

```sh
wasm
├── magic
├── version
└── module
    ├── section1
    │   ├── Function
    │   ├── Type
    │   ├── Code
    │   ├── Export
    │   ├── Table
    │   ├── Memory
    │   ├── Global
    │   ├── Start
    │   ├── Element
    │   ├── Data
    │   ├── Data_Count
    │   └── Custom
    ├── section2
    └── ...
```

```go
type Section struct {
    id uint8
    size uint32
    data []byte
}
```

```go
type TypeSection struct {
    id uint8 // 1
    size uint32
    data []FuncType
}

type FuncType struct {
    tag uint8 // 0x60
    arg ResultType
    ret ResultType
}

type ResultType []ValueType

type ValueType uint8
```

```go
type FunctionSection struct {
    id uint8 // 1
    size uint32
    data []TypeIdx
}

type TypeIdx uint32 // TypeSection.data のインデックス
```
