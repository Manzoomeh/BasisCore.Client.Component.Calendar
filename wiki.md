# Basis Calendar

![Image of Yaktocat](preview.jpg)

### Features

- Support for various suppliers
- Support persian calendar and gregorian calendar
- Support for various languages (Farsi , English)
- Add or edit Note and Tasks for a day
- Support share Notes with Other members of the Trustlogin
- Support add reminder for a Note
- Support define different templates for your calendar
- Support select date range

# Getting started

### installation

Add last version of BasisCore client library to your project

```html
<script src="https://cdn.basiscore.net/_js/basiscore-2.2.1.min.js"></script>
```

```javascript
const host = {
  repositories: {
    "bc.calendar": "/basiscore.calendar.component.js",
  },
};
```

### Usage

Here's an example of basic usage:

```html
<Basis
  core="component.bc.calendar"
  run="atclient"
  sourceid="db.form"
  setting-object="mySetting"
  rkey="3B5DF210-699A-4096-A65B-5F3F78C9B4DE"
></Basis>
```

### options

```javascript
<script>
    const mySetting = {
        dateProvider: "basisCalendar",
        displayNote: true,
        culture: "fa",
        lid: 1
    }
</script>
```

# User guide

### Properties

| Name           | Description                      | Default Value                                                           | Example values                                                            |
| -------------- | -------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| from           | Calendar start date              | Date of the first day of current month                                  | 1400/2/3                                                                  |
| to             | Calendar end date                | Date of the last day of current month                                   | 1400/2/31                                                                 |
| rkey           | rkey for the logged user         | -                                                                       | 3B5DF210-699A-4096-A65B-5F3F78C9B4DE                                      |
| sourceid       | The result of search form        | -                                                                       | db.form                                                                   |
| setting-object | The options for calendar setting | `{dateProvider: "basisCalendar",displayNote: true,culture: fa",lid: 1}` | `{dateProvider: "persianCalendar",displayNote: true,culture: fa",lid: 2}` |
