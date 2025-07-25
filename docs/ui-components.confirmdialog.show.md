<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@fizz/ui-components](./ui-components.md) &gt; [ConfirmDialog](./ui-components.confirmdialog.md) &gt; [show](./ui-components.confirmdialog.show.md)

## ConfirmDialog.show() method

Show the dialog.

**Signature:**

```typescript
show(text?: string, cancelText?: string, okayText?: string): Promise<boolean>;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

text


</td><td>

string


</td><td>

_(Optional)_ Message text.


</td></tr>
<tr><td>

cancelText


</td><td>

string


</td><td>

_(Optional)_ Cancel button text.


</td></tr>
<tr><td>

okayText


</td><td>

string


</td><td>

_(Optional)_ Confirm (okay) button text.


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;boolean&gt;

Promise of boolean indicating whether the user confirmed or cancelled.

