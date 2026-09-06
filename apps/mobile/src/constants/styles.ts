import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  block: {
    width: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    gap: 5,
  },
  blockDetailsInputForm: {
    width: '100%',
    padding: 20,
    gap: 20,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  blockComponentLeftColumn: {
    // backgroundColor: 'red', 
    borderRightWidth: 1,
    height: '100%',
    width: 70,
    paddingHorizontal: 1,
    alignItems: 'center',
  },
  listItem: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopWidth: 0,
    borderBottomWidth: 0.5,
    alignItems: 'center',
    padding: 10,
  },
  projectInputForm: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    gap: 20,
    padding: 20,
  },
  projectButton: {
    padding: 20,
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 100
  },
  boreholeInputForm: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    gap: 20,
    padding: 20,
  },
  boreholeButton: {
    padding: 20,
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 100
  },
  boreholeReadOnlyName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  boreholeReadOnlyCaption: {
    marginTop: -12,
    fontSize: 12,
    color: 'rgb(110, 110, 110)',
    textAlign: 'center',
  },
  projectAndBoreholeTextInput: {
    padding: 10,
    minHeight: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    textAlign: 'center',
  },
  confirmButton: {
    color: 'green',
  },
  cancelButton: {
    color: 'red',
  },
  deleteButton: {
    color: 'red',
  },
  textInput: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopWidth: 0,
    borderBottomWidth: 0.5, 
    padding: 10, 
    textAlign: 'center',
  }
});
