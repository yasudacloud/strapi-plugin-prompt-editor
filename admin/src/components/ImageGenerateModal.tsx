import {
  Button,
  ModalBody,
  ModalLayout,
  ModalFooter,
  ModalHeader,
  RawTbody, Radio, Typography
} from '@strapi/design-system';
import {Table, Tr, Td} from '@strapi/design-system';

import styled from 'styled-components';
import React, {useState} from "react";
import {getToken} from "../utils/getToken";
import {ChevronLeft, ChevronRight, Upload} from '@strapi/icons';
import {useIntl} from "react-intl";
import {getTranslation} from "../utils/getTranslation";

const Loading = styled.div<{
  message: string
}>`
  & {
    width: fit-content;
    font-weight: bold;
    font-family: sans-serif;
    font-size: 30px;
    padding: 0 5px 8px 0;
    background: repeating-linear-gradient(90deg, currentColor 0 8%, #0000 0 10%) 200% 100%/200% 3px no-repeat;
    animation: l3 2s steps(6) infinite;
  }

  &:before {
    content: "${(props) => props.message}"
  }

  @keyframes l3 {
    to {
      background-position: 80% 100%
    }
  }
`

const Center = styled.div`
  text-align: center;
`

interface Props {
  url?: string
  loading: boolean
  open: boolean
  onClose: (url?: string) => void
}

const ImageGenerateModal = ({loading, open, onClose, url}: Props) => {
  const [folders, setFolders] = useState([])
  const [showFolder, setFolder] = useState(false)
  const [folderIds, setFolderIds] = useState<number[]>([])
  const [selectFolder, setSelectFolder] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const {formatMessage} = useIntl();
  if (!open) {
    return null
  }

  const onShowFolder = async (folderId?: number) => {
    setFolder(true)
    if (folderId) {
      setFolderIds(folderIds.concat(folderId))
    } else {
      setFolderIds([])
    }
    const folderQuery = folderId ? `filters[$and][0][parent][id]=${folderId}` : `filters[$and][0][parent][id][$null]=true`
    const response = await fetch(`/upload/folders?sort=createdAt:DESC&page=1&pageSize=100&pagination[pageSize]=-1&${folderQuery}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
    if (response.status >= 400) {
      console.error(await response.text())
      alert(formatMessage({
        id: getTranslation('app.upload.load-error'),
        defaultMessage: 'Failed to acquire media library information'
      }))
    } else {
      const result = await response.json()
      setFolders(result.data)
    }
  }

  const onBackFolder = () => {
    if (folderIds.length === 1) {
      // to root
      setFolderIds([])
      onShowFolder()
    } else {
      // back
      const backFolderId = folderIds[folderIds.length - 2]
      const newFolderIds = structuredClone(folderIds)
      newFolderIds.pop()
      setFolderIds(newFolderIds)
      onShowFolder(backFolderId)
    }
  }
  const onUpload = async () => {
    setUploading(true)
    fetch(`/prompt-editor/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        url,
        folderId: selectFolder ? selectFolder.pathId : ''
      })
    }).then(async (response) => {
      const result = await response.json()
      onClose(result[0].url)
      setUploading(false)
    })
  }
  return (
    <ModalLayout onClose={() => onClose()} labelledBy="title">
      <ModalHeader>
      </ModalHeader>
      <ModalBody style={{maxHeight: '80%'}}>
        {
          loading && (
            <Loading message={formatMessage({
              id: getTranslation('app.upload.loading'),
              defaultMessage: 'Generating...'
            })}/>
          )
        }
        {
          (!loading && !showFolder) && (
            <>
              {/* Image Preview */}
              <Center>
                <a href={url} target={"_blank"}>
                  <img src={url} style={{maxWidth: 400}}/>
                </a>
              </Center>
            </>
          )
        }
        {
          (!loading && showFolder) && (
            <>
              {/* Image Upload */}
              <Table colCount={3} rowCount={1}>
                <RawTbody>
                  {
                    folderIds.length === 0 && (
                      <Tr>
                        <Td color="neutral800" style={{width: 40}}>
                          <Radio
                            value={null}
                            checked={selectFolder === null}
                            onChange={() => setSelectFolder(null)}
                          />
                        </Td>
                        <Td color="neutral800">
                          {
                            formatMessage({
                              id: getTranslation('app.upload.root'),
                              defaultMessage: 'Root Folder'
                            })
                          }
                        </Td>
                      </Tr>
                    )
                  }
                  {
                    folders.map((folder: any) => (
                      <Tr key={folder.id}>
                        <Td color="neutral800" style={{width: 40}}>
                          <Radio
                            value={folder.pathId}
                            checked={selectFolder && selectFolder.pathId === folder.pathId}
                            onChange={() => setSelectFolder(folder)}
                          />
                        </Td>
                        <Td color="neutral800">
                          {folder.name}
                        </Td>
                        <Td color="neutral800">
                          {
                            folder.children.count > 0 && (
                              <Button
                                variant={'ghost'}
                                endIcon={<ChevronRight/>}
                                style={{marginLeft: 'auto'}}
                                onClick={() => onShowFolder(folder.pathId)}
                              >{
                                formatMessage({
                                  id: getTranslation('app.upload.open'),
                                  defaultMessage: 'Open'
                                })
                              }</Button>
                            )
                          }
                        </Td>
                      </Tr>
                    ))
                  }
                </RawTbody>
              </Table>
            </>
          )
        }
      </ModalBody>
      <ModalFooter
        startActions={
          <>
            {
              !showFolder && (
                <Button variant={'tertiary'} disabled={loading} onClick={() => onClose()}>{
                  formatMessage({
                    id: getTranslation('app.upload.cancel'),
                    defaultMessage: 'Cancel'
                  })
                }</Button>
              )
            }
            {
              (showFolder && folderIds.length > 0) && (
                <Button variant={'tertiary'} onClick={onBackFolder} startIcon={<ChevronLeft/>}>{
                  formatMessage({
                    id: getTranslation('app.upload.back'),
                    defaultMessage: 'Back'
                  })
                }</Button>
              )
            }

          </>
        }
        endActions={
          <>
            {
              !showFolder && (
                <Button variant={'secondary'} disabled={loading} onClick={() => onShowFolder()}>{
                  formatMessage({
                    id: getTranslation('app.upload.next'),
                    defaultMessage: 'Next'
                  })
                }</Button>
              )
            }
            {
              showFolder && (
                <>
                  <Typography variant={'omega'}>
                    {
                      formatMessage({
                        id: getTranslation('app.upload.to'),
                        defaultMessage: 'upload to:'
                      })
                    }
                    &nbsp;{selectFolder ? selectFolder.name : formatMessage({
                    id: getTranslation('app.upload.root'),
                    defaultMessage: 'Root'
                  })}</Typography>
                  <Button
                    variant={'secondary'}
                    startIcon={<Upload/>}
                    onClick={onUpload}
                    loading={uploading}
                  >{formatMessage({
                    id: getTranslation('app.upload'),
                    defaultMessage: 'Upload'
                  })}</Button>
                </>
              )
            }
          </>
        }
      />
    </ModalLayout>
  )
}

export default ImageGenerateModal
