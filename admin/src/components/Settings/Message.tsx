import styled from 'styled-components';
import { Typography } from '@strapi/design-system';
import { Check } from '@strapi/icons';
import { getTranslation } from '../../utils/getTranslation';
import { useIntl } from 'react-intl';

const SaveMessage = styled.div`
  min-height: 25px;
  display: flex;
  align-items: center;
`;

const Success = styled(Typography)`
  color: #5cb85c;
  font-weight: bold;
`;

interface Props {
  isSuccess: boolean;
}

export const Message = (props: Props) => {
  const { formatMessage } = useIntl();
  const { isSuccess } = props;
  return (
    <SaveMessage>
      {isSuccess && (
        <>
          <Check fill={'#5cb85c'} />
          &nbsp;
          <div>
            <Success variant={'omega'}>
              {formatMessage({
                id: getTranslation('setting.form-saved'),
                defaultMessage: 'Configuration saved.',
              })}
            </Success>
          </div>
        </>
      )}
    </SaveMessage>
  );
};
