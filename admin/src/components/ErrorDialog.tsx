import { Button, Dialog, Typography } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { getTranslation } from '../utils/getTranslation';

interface Props {
  onClose: () => void;
}

export const ErrorDialog = (props: Props) => {
  const { formatMessage } = useIntl();
  return (
    <>
      <Dialog.Root open={true}>
        <Dialog.Content>
          <Dialog.Header>Error</Dialog.Header>
          <Dialog.Body>
            <Typography variant={'beta'}>
              {formatMessage({
                id: getTranslation('app.api-error'),
                defaultMessage: 'API call failed',
              })}
            </Typography>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Action>
              <Button fullWidth variant={'danger-light'} onClick={props.onClose}>
                OK
              </Button>
            </Dialog.Action>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};
