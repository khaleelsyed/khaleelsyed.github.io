---
title: "Go Function Return Types: Choosing Between Pointers and Values"
description: "Discover when to return pointers or values in Go, and how to choose between pointer and value receivers for better performance."
date: "Aug 17 2025"
---
One common Go interview and code review question is: "When should you use pointers and values?"

This decision impacts memory usage, performance, and the behaviour of your functions. Likewise, choosing between a pointer and a value receiver can influence efficiency.

In this guide, we'll explain how pointers and values work in function returns and method receivers and provide suggestions on which to choose given a situation.


## TL;DR

Use **pointer** receivers or returns when dealing with larger or immutable types or if the type's methods have concurrent methods.

If a type is small and is immutable, it's safe to use **value** receivers or returns.

If the type has fields that aren't safe to copy, you must use a **pointer** receiver.
## Returning Values and Pointers

Assuming we have a type `Point`, we have two options for returning a function: either as a value or a pointer.
### Value Return

```go
func NewPoint() Point{
	return Point{}
}

func main(){
	point := NewPoint()
	...
}
```


In the following example, the `Point` value is being returned from `NewPoint()`. The `Point` object will remain on the main goroutine's [stack](https://slipbox.khaleel.dev/slipbox/2502142225#stack). 

It's better to return a value for small or immutable types be returned as they're fast to copy into a stack.

### Pointer Return


```go
func NewPoint() *Point{
	return &Point{}
}

func main(has
	var point *Point = NewPoint()
	...
}
```


Returning a pointer means the object will escape to the [heap](https://slipbox.khaleel.dev/slipbox/2502142225#heap) rather than remain on the stack.

Long story short, return pointers when:
- Using large structs
- Modifying (mutable) objects
- Using structs from other packages
- A type is not considered to be safe to copy

An example of when it's necessary to return a pointer rather than its value are when a struct has an unsafe field to copy, such as `sync.Mutex`.

```go
type Counter struct{
	mu sync.Mutex
	total int
}

func NewCounter() *Counter{
	return &Counter{}
}
```



For more info, see the [Copying - Go Style](https://google.github.io/styleguide/go/decisions#copying) Decisions.

## Performance Impacts of Returning Values and Pointers

It may seem easy to return pointers all the time,  as it'll always be safe, but we don't realise the drawbacks of relying on heap memory.

We know that the heap is slower than the stack. Putting objects in the heap will eventually trigger a [garbage collection cycle](https://slipbox.khaleel.dev/slipbox/2502150002#phases-of-a-garbage-collection-cycle). More objects stored on the heap will mean more objects for the garbage collector to track and see if they're still reachable during [mark and sweep](https://slipbox.khaleel.dev/slipbox/2502142220). This means that more objects in the heap will lead to longer garbage collection cycles.

## What are Value and Pointer Receivers in Go?

In Go, methods can have receivers, which are declared before the method name. Receivers can be thought of as functions that receive objects for the function to operate on.

### Value Receiver

```go
func (p Point) ValidatePoint() error{
	...
}
```

Here we can see that we're receiving the value of the `Point` object with the variable `p`.

When value receivers are used, the value is copied into the method's stack frame.

Using value receivers is better when the receiving type is small, immutable, and safe to copy.
### Pointer Receiver

```go
func (p *Point) ValidatePoint() error{
	...
}
```

In a pointer receiver, the object is escaped to the heap.

Use pointer receivers when the receiving type is significantly large, is not safe to copy, or if you want to modify the receiver - as it's faster than copying it. If a method is concurrent, use a pointer receiver - to avoid introducing [race conditions](https://slipbox.khaleel.dev/slipbox/2508130030).

As mentioned, [mutexes](https://slipbox.khaleel.dev/slipbox/2508172148) are not safe to copy. If you have a mutex or another field that is not safe to copy, you must use pointer receivers.
## How Escape Analysis changes based on Value or Pointer Receivers

Escape analysis is a process performed by the compiler that decides when an object is escaped to the heap. From earlier, we know that more objects in the heap will lead to longer garbage collection cycles—this is because there are more objects to mark and sweep.

Although having more pointers to the same object won't necessarily increase the number of objects on the heap (as they all lead to the same memory address). The garbage collector still has more pointers to track in the source code, leading to longer collection cycles.

## Conclusion

When deciding between using pointer and value returns or receivers, it's important to note that there are no complex rules - you need to understand the trade-off between value receivers, which are better when defining methods, pick a receiver type and stick with it. The table below summarises when to use values and when to use pointers.

| Values                                      | Pointers                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| Small types                                 | Larger types                                                                |
| Immutable types                             | When types need to be modified                                              |
| All the fields in the type are safe to copy | If the type has fields that aren't safe to copy (for example, `sync.Mutex`) |
|                                             | Concurrent methods                                                          |
|                                             | Use when copying the fields of a `struct` can cause aliasing issues         |

## FAQ

1. **Can I always return pointers and use pointer receivers?** 
	*You can, the only drawback is that this may lead to longer and more frequent triggering of garbage collection cycles.*

2. **Do I improve performance if I use a pointer receiver?**
	*It can help improve larger structs' performance by avoiding copying onto the method's stack frame. For smaller types, the difference is negligible - use value receivers.*

3. **If I have methods that don't modify a type and methods that mutate the type, can I mix receiver types?**
	*To avoid confusion, it's better to stick with **either** a value or a pointer receiver.*

4. **Why is it unsafe to copy** `sync.Mutex`**?**
	*Copying a mutex can cause [race conditions](https://slipbox.khaleel.dev/slipbox/2508130030) to occur*
