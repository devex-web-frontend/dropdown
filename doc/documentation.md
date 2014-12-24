#Index

**Classes**

* [class: DropDown](#DropDown)
  * [new DropDown(control, config)](#new_DropDown)

**Events**

* [event: "dropdown:created"](#dropdown_created)
* [event: "dropdown:shown"](#dropdown_shown)
* [event: "dropdown:hidden"](#dropdown_hidden)
* [event: "dropdown:changed"](#dropdown_changed)

**Functions**

* [show()](#show)
* [hide()](#hide)
* [setSelectedIndex(index, [triggerChangeEvent])](#setSelectedIndex)
* [setDataList(data)](#setDataList)
* [setHoveredIndex(index)](#setHoveredIndex)
* [getSelectedIndex()](#getSelectedIndex)
* [getHoveredIndex()](#getHoveredIndex)
* [getBlock()](#getBlock)
* [getEventTarget()](#getEventTarget)
* [isShown()](#isShown)

**Members**

* [DropDown](#DropDown)
 
<a name="DropDown"></a>
#class: DropDown
**Members**

* [class: DropDown](#DropDown)
  * [new DropDown(control, config)](#new_DropDown)

<a name="new_DropDown"></a>
##new DropDown(control, config)
Creates new dropdown

**Params**

- control `Node` | `Element`  
- config `Object` - {Array:modifiers, String|Number:width, String:optionTmpl, String:groupTmpl, String:innerTmpl}  

<a name="dropdown_created"></a>
#event: "dropdown:created"
Dropdown is created

<a name="dropdown_shown"></a>
#event: "dropdown:shown"
Dropdown is shown

<a name="dropdown_hidden"></a>
#event: "dropdown:hidden"
Dropdown is hidden

<a name="dropdown_changed"></a>
#event: "dropdown:changed"
Dropdown has changed

<a name="show"></a>
#show()
Shows dropdown

<a name="hide"></a>
#hide()
Hides dropdown

<a name="setSelectedIndex"></a>
#setSelectedIndex(index, [triggerChangeEvent])
Sets popup selectedelement by index

**Params**

- index `Number`  
- \[triggerChangeEvent=false\] `bool` - whether or not trigger dropdown:changed event  

<a name="setDataList"></a>
#setDataList(data)
Sets popup data list

**Params**

- data `Object`  

<a name="setHoveredIndex"></a>
#setHoveredIndex(index)
Sets popup hoveredelement by index

**Params**

- index `Number`  

<a name="getSelectedIndex"></a>
#getSelectedIndex()
Gets popup selectedelement by index

**Returns**: `Number` - selectedIndex  
<a name="getHoveredIndex"></a>
#getHoveredIndex()
Gets popup hoveredelement by index

**Returns**: `Number` - hoveredIndex  
<a name="getBlock"></a>
#getBlock()
Gets HTMLNode containing dropdown

**Returns**: `Node`  
<a name="getEventTarget"></a>
#getEventTarget()
Gets element which listens to events

**Returns**: `Node`  
<a name="isShown"></a>
#isShown()
Gets whether dropdown is shown

**Returns**: `bool`  
<a name="DropDown"></a>
#DropDown
**Copyright**: Devexperts  
