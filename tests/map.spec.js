/* eslint-disable no-undef, react/prop-types */

import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';
import createForm from '../src/createForm';

class TestComponent extends React.Component {
  render() {
    const { getFieldProps } = this.props.form;
    return (<div>
      <input {...getFieldProps('normal')} />
      <input {...getFieldProps('normal2')} />
    </div>);
  }
}


describe('map usage', () => {
  let container;
  let component;
  let form;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  });


  describe('onFieldsChange works', () => {
    it('onFieldsChange works: fields', () => {
      const Test = createForm({
        withRef: true,
        onFieldsChange(props, fields) {
          expect(Object.keys(fields).length).toBe(1);
          const field = fields.normal;
          expect(field.name).toBe('normal');
          expect(field.value).toBe('3');
        },
        mapPropsToFields(props) {
          return {
            normal: {
              value: props.formState.normal,
            },
          };
        },
      })(TestComponent);
      component = ReactDOM.render(<Test formState={{ normal: '2' }}/>, container);
      component = component.refs.wrappedComponent;
      form = component.props.form;
      expect(form.getFieldInstance('normal').value).toBe('2');
      expect(form.getFieldValue('normal')).toBe('2');
      expect(form.getFieldInstance('normal2').value).toBe('');
      expect(form.getFieldValue('normal2')).toBe(undefined);
      form.getFieldInstance('normal').value = '3';
      Simulate.change(form.getFieldInstance('normal'));
      expect(form.getFieldValue('normal')).toBe('3');
    });
    it('onFieldsChange works: allFields', () => {
      const Test = createForm({
        withRef: true,
        onFieldsChange(props, fields, allFields) {
          if (fields.normal) return;
          expect(Object.keys(allFields).length).toBe(2);
          const fileChanged = fields.normal2;
          expect(fileChanged.name).toBe('normal2');
          expect(fileChanged.value).toBe('B');
          const fieldNotChanged = allFields.normal;
          expect(fieldNotChanged.name).toBe('normal');
          expect(fieldNotChanged.value).toBe('3');
        },
        mapPropsToFields(props) {
          return {
            normal: {
              value: props.formState.normal,
            },
            normal2: {
              value: props.formState.normal2,
            },
          };
        },
      })(TestComponent);
      component = ReactDOM.render(<Test formState={{ normal: '2', normal2: 'A' }}/>, container);
      component = component.refs.wrappedComponent;
      form = component.props.form;
      expect(form.getFieldInstance('normal').value).toBe('2');
      expect(form.getFieldValue('normal')).toBe('2');
      expect(form.getFieldInstance('normal2').value).toBe('A');
      expect(form.getFieldValue('normal2')).toBe('A');
      form.getFieldInstance('normal').value = '3';
      Simulate.change(form.getFieldInstance('normal'));
      form.getFieldInstance('normal2').value = 'B';
      Simulate.change(form.getFieldInstance('normal2'));
    });
  });


  it('mapPropsToFields\'s return value will be merge to current fields', () => {
    const Test = createForm({
      withRef: true,
      mapPropsToFields(props) {
        return {
          normal: {
            value: props.formState.normal,
          },
        };
      },
    })(TestComponent);
    component = ReactDOM.render(<Test formState={{ normal: '2' }}/>, container);
    component = component.refs.wrappedComponent;
    form = component.props.form;
    form.getFieldInstance('normal2').value = '3';
    Simulate.change(form.getFieldInstance('normal2'));
    component = ReactDOM.render(<Test formState={{ normal: '1' }}/>, container);
    expect(form.getFieldValue('normal2')).toBe('3');
  });

  it('mapProps works', () => {
    const Test = createForm({
      withRef: true,
      mapProps(props) {
        return {
          ...props,
          x: props.x + 1,
        };
      },
    })(TestComponent);
    component = ReactDOM.render(<Test x={2}/>, container);
    component = component.refs.wrappedComponent;
    expect(component.props.x).toBe(3);
  });
});
