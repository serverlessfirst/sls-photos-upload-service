import React from 'react';
import { getPhotos } from '../../utils/photos-api-client';
import { EventPhoto } from '../../../../../services/common/schemas/photos-api';

export interface PhotosListProps {
  eventId: string;
}
export interface PhotosListState {
  photos: EventPhoto[];
}

class PhotosList extends React.Component<PhotosListProps, PhotosListState> {
  constructor(props: PhotosListProps) {
    super(props);
    this.state = { photos: [] };
  }

  async componentDidMount() {
    const photos = await getPhotos(this.props.eventId);
    this.setState( { photos });
  }

  render() {
    const { eventId } = this.props;
    return (
      <div>
        <div>list of photos for event {eventId} </div>
        <ul>
          {this.state.photos.map(photo =>
            <li key={photo.id}>
              <img src={photo.url} alt={photo.description}/>

            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default PhotosList;
