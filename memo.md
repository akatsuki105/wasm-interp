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
