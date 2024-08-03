---
title: "You've been using sets wrong this whole time - Python"
description: "Teaching Python how to differentiate between objects"
date: "Aug 03 2024"
---
Imagine you've built this cool bit of logic that relies on using a Set of objects. You've written the class yourself, and now you're passing objects into a set like so.

```python
class CleverClass:
    def __init__(self, name: str, data: dict[str, bool]) -> None:
        self.name = name
        self.data = data

```
<center><i>Define a simple class with two attributes, <code>name</code> and <code>data</code>.</i></center>

```python
>>> clever_object_a = CleverClass("a", {"alias": "Alpha"})
>>> clever_object_b = CleverClass("b", {"alias": "Bravo"})
>>> clever_object_set = {clever_object_a, clever_object_b}

>>> clever_object_set.add(CleverClass("a", {"alias": "Alpha"}))
>>> len(clever_object_set)
3
```
<center><i>The length of the set is <code>3</code></i></center>

Now we all know about the python Set - every element in there is unique. Because a new object is being created, there will be 3 elements in that set. When the Python runs the `hash()` function on the final object, it will be different to that of the first two objects.

```python
>>> clever_object_a = CleverClass("a", {"alias": "Alpha"})
>>> hash(clever_object_a)
120903706381
>>>hash(CleverClass("a", {"alias": "Alpha"}))
120903706389
```
<center><i>The example above will print a different hash each time</i></center>

`hash()` is a built-in Python method that is used to calculate the integer hash value of an object. This means that generally the hash value of each object will be unique - the hash values can be controlled by adding a  `__hash__()` method to a class.

As python's `hash()` function expects integer values, our `__hash__()` method must also return an `int`. We can concatenate the name and data attributes as strings and then calculate the hash value in one go (rather than adding the hashes separately to avoid colliding hashes).

```python
class CleverClass:
    def __init__(self, name: str, data: dict[str, bool]) -> None:
        self.name = name
        self.data = data

	def __hash__(self) -> int:
		return hash(self.name + str(self.data))
```

```python
>>> clever_object_a = CleverClass("a", {"alias": "Alpha"})
>>> hash(clever_object_a)
948855205610507482
>>> hash(CleverClass("a", {"alias": "Alpha"}))
948855205610507482

>>> hash(CleverClass("c", {"alias": "Charlie"})) == hash(CleverClass("c", {"alias": "Charlie"}))
True
```
<center><i>The hash values will be the same this time.</i></center>

However, if we try to insert objects with similar attributes into a set - similar to the above logic  we can see there are still 3 objects in that set. The reason for this is because Python does not consider the two objects equal - even though the hashes are the same!

```python
>>> clever_object_one = CleverClass("d", {"alias": "Delta"})
>>> clever_object_two = CleverClass("d", {"alias": "Delta"})
>>> hash(clever_object_one) == hash(clever_object_two)
True
>>> clever_object_one == clever_object_two
False
```

In order to overcome this, we can define the `__eq__()` method in our class. 

```python
class CleverClass:
    def __init__(self, name: str, data: dict[str, bool]) -> None:
        self.name = name
        self.data = data

	def __hash__(self) -> int:
		return hash(self.name + str(self.data))

	def __eq__(self, other: object) -> bool:
		if not isinstance(other, CleverClass):
			return NotImplemented
		
		name_match = self.name == other.name
		data_match = self.data == other.data
		return name_match and data_match
```

Now when objects with the same attributes are compared, they will now return `True`.

```python
>>> clever_object_one = CleverClass("e", {"alias": "Echo"})
>>> clever_object_two = CleverClass("e", {"alias": "Echo"})
>>> hash(clever_object_one) == hash(clever_object_two)
True
>>> clever_object_one == clever_object_two
True
```
<center><i>Hash comparison and object equality checks determine they're both equal. </i></center>

Now when objects with the same attributes are inserted into the set, they will not be reinserted as the their hashes will match as well as the equality checks of the objects will be `True`.

```python
>>> clever_object_a = CleverClass("a", {"alias": "Alpha"})
>>> clever_object_b = CleverClass("b", {"alias": "Bravo"})
>>> clever_object_set = {clever_object_a, clever_object_b}

>>> clever_object_set.add(CleverClass("a", {"alias": "Alpha"}))
>>> len(clever_object_set)
2
```

## Things to note

The hash value is only as reliable as the hashing function. Python's hash method always returns an `int`, which is why all `__hash__()` methods must also return an `int`. This may lead to collisions occurring more frequently, in contrast to other popular hash algorithms that use hexadecimal characters.
